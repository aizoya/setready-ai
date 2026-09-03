"use client";

import { FormEvent, useState } from "react";

type AnalysisResult = {
  ok: boolean;
  eventId?: string;
  recommendation?: string;
  error?: string;
  evidence?: {
    clickhouseReadRows: number;
    clickhouseWrite: boolean;
    model: string;
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
            Deterministic validation → ClickHouse context → Gemini analysis on Google Cloud → ClickHouse evidence write.
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
              <span>Gemini: {result.evidence.model}</span>
              <span>Google Cloud: {result.evidence.location}</span>
              <span>ClickHouse read: {result.evidence.clickhouseReadRows} prior rows</span>
              <span>ClickHouse write: {result.evidence.clickhouseWrite ? "confirmed" : "not confirmed"}</span>
              <span>Latency: {result.evidence.latencyMs} ms</span>
            </div>
          )}
        </section>
      )}

      <section className="grid technologyGrid">
        <article><strong>Gemini</strong><span>Reasoning & bounded recommendation</span></article>
        <article><strong>Google Cloud</strong><span>Gemini Enterprise / Vertex runtime</span></article>
        <article><strong>ClickHouse</strong><span>Runtime context, telemetry & evidence</span></article>
        <article><strong>Deterministic controls</strong><span>Validation, state boundaries & writes</span></article>
      </section>
    </main>
  );
}
