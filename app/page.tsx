"use client";

import { FormEvent, useState } from "react";

type AnalysisResult = {
  ok: boolean;
  eventId?: string;
  recommendation?: string;
  error?: string;
  evidence?: {
    agentPlatform: boolean;
    agent: string;
    interactionId: string;
    clickhouseMcp: boolean;
    clickhouseMcpServer: string;
    clickhouseWrite: boolean;
    googleCloudProject: string;
    location: string;
    latencyMs: number;
  };
};

export default function Home() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function analyze(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setResult(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      production: form.get("production"),
      scene: form.get("scene"),
      minutesBehind: Number(form.get("minutesBehind")),
      cause: form.get("cause"),
      nextConstraint: form.get("nextConstraint"),
    };

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      setResult(await response.json());
    } catch {
      setResult({ ok: false, error: "Unable to reach the SetReady runtime." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">AIZOYA · Agentic Cinema Hackathon</p>
        <h1>SetReady AI</h1>
        <p className="lede">
          Production intelligence for film and television crews. Convert a schedule disruption into a bounded,
          evidence-backed recommendation for the 1st AD and UPM.
        </p>
      </section>

      <section className="panel">
        <div>
          <span className="status">Golden-path demo</span>
          <h2>Analyze a production disruption.</h2>
          <p>
            Deterministic validation → Gemini Enterprise Agent Platform → official ClickHouse MCP context → bounded recommendation → ClickHouse evidence write.
          </p>
        </div>

        <form className="demoForm" onSubmit={analyze}>
          <label>
            Production
            <input name="production" defaultValue="Harbor Lights" required />
          </label>
          <div className="formGrid">
            <label>
              Scene
              <input name="scene" defaultValue="42B" required />
            </label>
            <label>
              Minutes behind
              <input name="minutesBehind" type="number" min="1" max="360" defaultValue="35" required />
            </label>
          </div>
          <label>
            Cause
            <textarea name="cause" defaultValue="Lighting reset is taking longer than planned after a location power issue." required />
          </label>
          <label>
            Next constraint
            <textarea name="nextConstraint" defaultValue="Lead actor has a hard out in 95 minutes and the next setup requires a 25-minute company move." required />
          </label>
          <button type="submit" disabled={loading}>{loading ? "Analyzing…" : "Run SetReady analysis"}</button>
        </form>
      </section>

      {result && (
        <section className={`result ${result.ok ? "success" : "failure"}`} aria-live="polite">
          <div className="resultHeader">
            <strong>{result.ok ? "Runtime verified" : "Runtime needs configuration"}</strong>
            {result.eventId && <span>Event {result.eventId.slice(0, 8)}</span>}
          </div>
          {result.recommendation && <pre>{result.recommendation}</pre>}
          {result.error && <p>{result.error}</p>}
          {result.evidence && (
            <div className="evidenceGrid">
              <span>Agent Platform: {result.evidence.agentPlatform ? "verified" : "not verified"}</span>
              <span>Agent: {result.evidence.agent}</span>
              <span>Interaction: {result.evidence.interactionId ? result.evidence.interactionId.slice(0, 18) : "not returned"}</span>
              <span>ClickHouse MCP: {result.evidence.clickhouseMcp ? result.evidence.clickhouseMcpServer : "not verified"}</span>
              <span>ClickHouse evidence write: {result.evidence.clickhouseWrite ? "confirmed" : "not confirmed"}</span>
              <span>Google Cloud: {result.evidence.location}</span>
              <span>Latency: {result.evidence.latencyMs} ms</span>
            </div>
          )}
        </section>
      )}

      <section className="grid technologyGrid">
        <article><strong>Gemini</strong><span>Reasoning through a managed production agent</span></article>
        <article><strong>Google Cloud Agent Builder</strong><span>Gemini Enterprise Agent Platform orchestration</span></article>
        <article><strong>ClickHouse MCP</strong><span>Official MCP runtime context for production history</span></article>
        <article><strong>Deterministic controls</strong><span>Validation, persistence boundaries & auditable writes</span></article>
      </section>
    </main>
  );
}
