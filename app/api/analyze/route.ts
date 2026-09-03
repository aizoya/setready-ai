import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@clickhouse/client";
import { ExternalAccountClient } from "google-auth-library";
import { getVercelOidcToken } from "@vercel/oidc";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 60;

const disruptionSchema = z.object({
  production: z.string().min(2).max(120),
  scene: z.string().min(1).max(80),
  minutesBehind: z.coerce.number().int().min(1).max(360),
  cause: z.string().min(3).max(500),
  nextConstraint: z.string().min(3).max(500),
});

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  let clickhouse: ReturnType<typeof createClient> | undefined;

  try {
    const input = disruptionSchema.parse(await request.json());

    // Reuse the existing Vercel -> Google Cloud Workload Identity Federation setup.
    // No long-lived service-account key is stored in Vercel.
    const project = process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || required("GCP_PROJECT_ID");
    const projectNumber = required("GCP_PROJECT_NUMBER");
    const serviceAccountEmail = required("GCP_SERVICE_ACCOUNT_EMAIL");
    const workloadPoolId = required("GCP_WORKLOAD_IDENTITY_POOL_ID");
    const workloadProviderId = required("GCP_WORKLOAD_IDENTITY_PROVIDER_ID");

    const oidcToken = await getVercelOidcToken();
    if (!oidcToken) throw new Error("Vercel OIDC token is unavailable; verify Secure Backend Access is enabled");

    const authClient = ExternalAccountClient.fromJSON({
      type: "external_account",
      audience: `//iam.googleapis.com/projects/${projectNumber}/locations/global/workloadIdentityPools/${workloadPoolId}/providers/${workloadProviderId}`,
      subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
      token_url: "https://sts.googleapis.com/v1/token",
      service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${serviceAccountEmail}:generateAccessToken`,
      subject_token_supplier: {
        getSubjectToken: async () => oidcToken,
      },
    } as any);

    if (!authClient) throw new Error("Unable to initialize Google Workload Identity auth client");
    authClient.scopes = ["https://www.googleapis.com/auth/cloud-platform"];

    const agent = process.env.GOOGLE_AGENT_ID || "antigravity-preview-05-2026";
    const mcpUrl = required("CLICKHOUSE_MCP_URL");
    const mcpToken = process.env.CLICKHOUSE_MCP_AUTH_TOKEN;

    const clickhouseHost = required("CLICKHOUSE_HOST");
    const clickhouseDatabase = required("CLICKHOUSE_DATABASE");
    const clickhouseUsername = required("CLICKHOUSE_USERNAME");
    const clickhousePassword = required("CLICKHOUSE_PASSWORD");

    clickhouse = createClient({
      url: clickhouseHost,
      database: clickhouseDatabase,
      username: clickhouseUsername,
      password: clickhousePassword,
    });

    await clickhouse.command({
      query: `
        CREATE TABLE IF NOT EXISTS setready_events (
          event_id String,
          created_at DateTime64(3),
          production String,
          scene String,
          minutes_behind UInt16,
          cause String,
          next_constraint String,
          recommendation String,
          model String DEFAULT '',
          agent String DEFAULT '',
          latency_ms UInt32
        ) ENGINE = MergeTree
        ORDER BY (created_at, event_id)
      `,
      clickhouse_settings: { wait_end_of_query: 1 },
    });

    await clickhouse.command({
      query: "ALTER TABLE setready_events ADD COLUMN IF NOT EXISTS agent String DEFAULT ''",
      clickhouse_settings: { wait_end_of_query: 1 },
    });

    const ai = new GoogleGenAI({
      enterprise: true,
      project,
      location: "global",
      googleAuthOptions: {
        authClient: authClient as any,
        projectId: project,
        scopes: ["https://www.googleapis.com/auth/cloud-platform"],
      } as any,
    });

    const prompt = `You are SetReady AI, a bounded production-intelligence agent for film and television set operations.
Your audience is the 1st AD and UPM.

MANDATORY TOOL STEP
Use the attached ClickHouse MCP server before answering. Query the setready_events table for up to the 3 most recent records for production ${JSON.stringify(input.production)}. Treat that MCP result as historical context only. If no rows exist, continue and state that no prior events were found.

BOUNDARIES
- Do not invent facts.
- Do not make safety-critical, legal, union, or personnel decisions.
- Give one concise operational recommendation.
- Explicitly state assumptions and an escalation trigger.

CURRENT DISRUPTION
Production: ${input.production}
Scene: ${input.scene}
Minutes behind: ${input.minutesBehind}
Cause: ${input.cause}
Next constraint: ${input.nextConstraint}

Return exactly these headings:
Impact:
Recommendation:
Assumptions:
Escalation trigger:`;

    const mcpTool = {
      type: "mcp_server" as const,
      url: mcpUrl,
      name: "clickhouse-setready",
      ...(mcpToken
        ? { headers: { Authorization: `Bearer ${mcpToken}` } }
        : {}),
    };

    const stream = await ai.interactions.create({
      agent: agent as any,
      input: prompt,
      tools: [mcpTool as any],
      stream: true,
      background: true,
      store: true,
    });

    let recommendation = "";
    let interactionId = "";
    let mcpUsed = false;

    for await (const event of stream) {
      const evt = event as Record<string, any>;
      const serialized = JSON.stringify(evt).toLowerCase();

      if (serialized.includes("mcp") && serialized.includes("clickhouse")) {
        mcpUsed = true;
      }

      if (evt.interaction?.id) interactionId = String(evt.interaction.id);

      const text =
        evt.delta?.text ??
        evt.content?.text ??
        evt.text ??
        evt.interaction?.output_text ??
        "";

      if (typeof text === "string" && text) recommendation += text;
    }

    recommendation = recommendation.trim();
    if (!recommendation) throw new Error("Agent Platform returned an empty recommendation");
    if (!mcpUsed) throw new Error("ClickHouse MCP tool was not invoked; runtime verification failed");

    const eventId = crypto.randomUUID();
    const latencyMs = Date.now() - startedAt;

    await clickhouse.insert({
      table: "setready_events",
      values: [{
        event_id: eventId,
        created_at: new Date().toISOString().replace("T", " ").replace("Z", ""),
        production: input.production,
        scene: input.scene,
        minutes_behind: input.minutesBehind,
        cause: input.cause,
        next_constraint: input.nextConstraint,
        recommendation,
        model: "Gemini via Agent Platform",
        agent,
        latency_ms: latencyMs,
      }],
      format: "JSONEachRow",
    });

    return NextResponse.json({
      ok: true,
      eventId,
      recommendation,
      evidence: {
        oidc: true,
        agentPlatform: true,
        agent,
        interactionId,
        clickhouseMcp: true,
        clickhouseMcpServer: "mcp-clickhouse",
        clickhouseWrite: true,
        googleCloudProject: project,
        location: "global",
        latencyMs,
      },
    });
  } catch (error) {
    const message = error instanceof z.ZodError
      ? error.issues.map((issue) => issue.message).join("; ")
      : error instanceof Error
        ? error.message
        : "Unknown runtime error";

    console.error("SetReady analysis failed", error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  } finally {
    await clickhouse?.close().catch(() => undefined);
  }
}
