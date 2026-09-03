import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@clickhouse/client";
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

    const project = required("GOOGLE_CLOUD_PROJECT");
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

    // Deterministic persistence is intentionally separate from agent reasoning.
    // The agent must use the official ClickHouse MCP server for analytical context.
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
      vertexai: true,
      project,
      location: "global",
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

    const mcpTool: Record<string, unknown> = {
      type: "mcp_server",
      url: mcpUrl,
      name: "clickhouse-setready",
    };
    if (mcpToken) {
      mcpTool.headers = { Authorization: `Bearer ${mcpToken}` };
    }

    const stream = await ai.interactions.create({
      agent,
      input: prompt,
      environment: { type: "remote" },
      tools: [mcpTool],
      stream: true,
      background: true,
      store: true,
    } as never);

    let recommendation = "";
    let interactionId = "";
    let mcpUsed = false;

    for await (const event of stream as AsyncIterable<unknown>) {
      const evt = event as Record<string, any>;
      if (evt.event_type === "interaction.created") {
        interactionId = evt.interaction?.id || interactionId;
      }
      if (evt.event_type === "step.start") {
        const stepType = String(evt.step?.type || "").toLowerCase();
        const stepName = String(evt.step?.name || "").toLowerCase();
        if (stepType.includes("mcp") || stepName.includes("clickhouse")) mcpUsed = true;
      }
      if (evt.event_type === "step.delta" && evt.delta?.type === "text" && evt.delta?.text) {
        recommendation += String(evt.delta.text);
      }
      if (evt.event_type === "interaction.completed") {
        interactionId = evt.interaction?.id || interactionId;
      }
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
