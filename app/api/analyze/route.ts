import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@clickhouse/client";
import { z } from "zod";

export const runtime = "nodejs";

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
    const location = required("GOOGLE_CLOUD_LOCATION");
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

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
          model String,
          latency_ms UInt32
        ) ENGINE = MergeTree
        ORDER BY (created_at, event_id)
      `,
      clickhouse_settings: { wait_end_of_query: 1 },
    });

    const recentResult = await clickhouse.query({
      query: `
        SELECT production, scene, minutes_behind, cause, recommendation
        FROM setready_events
        WHERE production = {production:String}
        ORDER BY created_at DESC
        LIMIT 3
      `,
      query_params: { production: input.production },
      format: "JSONEachRow",
    });
    const recentEvents = await recentResult.json();

    const ai = new GoogleGenAI({
      vertexai: true,
      project,
      location,
      apiVersion: "v1",
    });

    const prompt = `You are SetReady AI, a bounded production-intelligence assistant for film/TV set operations.
Your audience is the 1st AD and UPM. Do not invent facts. Do not make safety-critical, legal, union, or personnel decisions. Give one concise operational recommendation and explicitly state assumptions.

CURRENT DISRUPTION
Production: ${input.production}
Scene: ${input.scene}
Minutes behind: ${input.minutesBehind}
Cause: ${input.cause}
Next constraint: ${input.nextConstraint}

RECENT CLICKHOUSE CONTEXT
${JSON.stringify(recentEvents)}

Return exactly these headings:
Impact:
Recommendation:
Assumptions:
Escalation trigger:`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        temperature: 0.2,
        maxOutputTokens: 500,
      },
    });

    const recommendation = response.text?.trim();
    if (!recommendation) throw new Error("Gemini returned an empty response");

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
        model,
        latency_ms: latencyMs,
      }],
      format: "JSONEachRow",
    });

    return NextResponse.json({
      ok: true,
      eventId,
      recommendation,
      evidence: {
        clickhouseReadRows: Array.isArray(recentEvents) ? recentEvents.length : 0,
        clickhouseWrite: true,
        model,
        googleCloudProject: project,
        location,
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
