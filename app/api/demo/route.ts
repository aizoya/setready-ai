import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const requestSchema = z.object({
  delayMinutes: z.coerce.number().int().min(1).max(240).default(35),
  scene: z.string().trim().min(1).max(120).default("Scene 42A — exterior dialogue"),
  cause: z.string().trim().min(1).max(240).default("Lighting reset and company move ran long"),
});

type McpEnvelope = {
  jsonrpc?: string;
  id?: number | string;
  result?: unknown;
  error?: unknown;
};

function parseMcpBody(text: string): McpEnvelope {
  const dataLines = text
    .split("\n")
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trim())
    .filter(Boolean);

  const candidate = dataLines.at(-1) ?? text.trim();
  return JSON.parse(candidate) as McpEnvelope;
}

async function callClickHouseMcp() {
  const url = process.env.CLICKHOUSE_MCP_URL;
  const token = process.env.CLICKHOUSE_MCP_AUTH_TOKEN;

  if (!url || !token) {
    return {
      ok: false as const,
      configured: false,
      detail: "CLICKHOUSE_MCP_URL or CLICKHOUSE_MCP_AUTH_TOKEN is not configured.",
    };
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
  };

  const initialize = await fetch(url, {
    method: "POST",
    headers,
    cache: "no-store",
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2025-03-26",
        capabilities: {},
        clientInfo: { name: "setready-ai", version: "0.2.0" },
      },
    }),
  });

  if (!initialize.ok) {
    throw new Error(`ClickHouse MCP initialize failed (${initialize.status}).`);
  }

  const sessionId = initialize.headers.get("mcp-session-id");
  if (!sessionId) throw new Error("ClickHouse MCP did not return an MCP session ID.");

  await fetch(url, {
    method: "POST",
    headers: { ...headers, "Mcp-Session-Id": sessionId },
    cache: "no-store",
    body: JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }),
  });

  const queryResponse = await fetch(url, {
    method: "POST",
    headers: { ...headers, "Mcp-Session-Id": sessionId },
    cache: "no-store",
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: {
        name: "run_query",
        arguments: {
          query: "SELECT 1 AS clickhouse_runtime_ok, now() AS verified_at",
        },
      },
    }),
  });

  const raw = await queryResponse.text();
  if (!queryResponse.ok) {
    throw new Error(`ClickHouse MCP query failed (${queryResponse.status}): ${raw.slice(0, 240)}`);
  }

  const envelope = parseMcpBody(raw);
  if (envelope.error) throw new Error(`ClickHouse MCP returned an error: ${JSON.stringify(envelope.error)}`);

  return {
    ok: true as const,
    configured: true,
    detail: envelope.result,
  };
}

async function callGemini(input: z.infer<typeof requestSchema>, clickHouseEvidence: unknown) {
  const project = process.env.GOOGLE_CLOUD_PROJECT;
  const location = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  if (!project) {
    return {
      ok: false as const,
      configured: false,
      recommendation:
        "Protect the next hard production dependency first: confirm remaining setup time, identify the earliest recoverable schedule beat, and require the 1st AD/UPM to approve any scene-order change.",
      detail: "GOOGLE_CLOUD_PROJECT is not configured.",
    };
  }

  try {
    const ai = new GoogleGenAI({ vertexai: true, project, location });
    const prompt = `You are SetReady AI, a bounded production-intelligence assistant for film/TV crews.\n\nDisruption:\n- Scene: ${input.scene}\n- Delay: ${input.delayMinutes} minutes\n- Cause: ${input.cause}\n\nRuntime evidence from ClickHouse MCP:\n${JSON.stringify(clickHouseEvidence).slice(0, 1800)}\n\nReturn a concise operational recommendation for a 1st AD and UPM. Include: (1) immediate action, (2) schedule/economic risk, (3) one approval gate. Do not invent crew, cast, labor, weather, safety, or budget facts that were not supplied.`;

    const response = await ai.models.generateContent({ model, contents: prompt });
    return {
      ok: true as const,
      configured: true,
      recommendation: response.text?.trim() || "Gemini returned an empty response.",
      detail: { model, location },
    };
  } catch (error) {
    return {
      ok: false as const,
      configured: true,
      recommendation:
        "Protect the next hard production dependency first: confirm remaining setup time, identify the earliest recoverable schedule beat, and require the 1st AD/UPM to approve any scene-order change.",
      detail: error instanceof Error ? error.message : "Gemini request failed.",
    };
  }
}

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());
    const clickhouse = await callClickHouseMcp();
    const gemini = await callGemini(body, clickhouse.ok ? clickhouse.detail : clickhouse.detail);

    return NextResponse.json({
      ok: clickhouse.ok && gemini.ok,
      event: {
        scene: body.scene,
        delayMinutes: body.delayMinutes,
        cause: body.cause,
        validatedAt: new Date().toISOString(),
      },
      providers: {
        clickhouse: {
          status: clickhouse.ok ? "verified-live" : clickhouse.configured ? "error" : "not-configured",
          evidence: clickhouse.detail,
        },
        gemini: {
          status: gemini.ok ? "verified-live" : gemini.configured ? "error" : "not-configured",
          detail: gemini.detail,
        },
      },
      recommendation: gemini.recommendation,
      controls: [
        "Input bounds validated before provider calls",
        "ClickHouse runtime query is read-only",
        "Recommendation requires human production approval before schedule changes",
      ],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown demo error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
