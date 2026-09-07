"use client";

import { FormEvent, useState } from "react";

type DemoResult = {
  ok?: boolean;
  error?: string;
  event?: { scene: string; delayMinutes: number; cause: string; validatedAt: string };
  providers?: {
    clickhouse: { status: string; evidence: unknown };
    gemini: { status: string; detail: unknown };
  };
  recommendation?: string;
  controls?: string[];
};

export default function DemoClient() {
  const [scene, setScene] = useState("Scene 42A — exterior dialogue");
  const [delayMinutes, setDelayMinutes] = useState(35);
  const [cause, setCause] = useState("Lighting reset and company move ran long");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DemoResult | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scene, delayMinutes, cause }),
      });
      const payload = (await response.json()) as DemoResult;
      setResult(payload);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : "Demo request failed." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="demo panel" aria-labelledby="demo-title">
      <div>
        <span className="status">Live runtime test</span>
        <h2 id="demo-title">Analyze a production disruption</h2>
        <p>
          The demo validates the event, executes a live read-only query through the ClickHouse MCP
          service on Google Cloud Run, and asks Gemini for a bounded operational recommendation.
        </p>
      </div>

      <form className="demoForm" onSubmit={submit}>
        <label>
          Scene
          <input value={scene} onChange={(e) => setScene(e.target.value)} maxLength={120} required />
        </label>
        <label>
          Delay (minutes)
          <input
            type="number"
            min={1}
            max={240}
            value={delayMinutes}
            onChange={(e) => setDelayMinutes(Number(e.target.value))}
            required
          />
        </label>
        <label>
          Cause
          <textarea value={cause} onChange={(e) => setCause(e.target.value)} maxLength={240} required />
        </label>
        <button type="submit" disabled={loading}>{loading ? "Analyzing…" : "Run live analysis"}</button>
      </form>

      {result && (
        <div className="result" aria-live="polite">
          {result.error ? (
            <p className="errorText"><strong>Runtime error:</strong> {result.error}</p>
          ) : (
            <>
              <div className="providerRow">
                <ProviderBadge label="ClickHouse" status={result.providers?.clickhouse.status ?? "unknown"} />
                <ProviderBadge label="Gemini" status={result.providers?.gemini.status ?? "unknown"} />
              </div>
              <h3>Recommendation</h3>
              <p className="recommendation">{result.recommendation}</p>
              {result.controls && (
                <div className="controls">
                  <strong>Deterministic controls</strong>
                  <ul>{result.controls.map((control) => <li key={control}>{control}</li>)}</ul>
                </div>
              )}
              <details>
                <summary>Runtime evidence</summary>
                <pre>{JSON.stringify({ event: result.event, providers: result.providers }, null, 2)}</pre>
              </details>
            </>
          )}
        </div>
      )}
    </section>
  );
}

function ProviderBadge({ label, status }: { label: string; status: string }) {
  return (
    <span className={`provider ${status === "verified-live" ? "providerLive" : "providerWarn"}`}>
      <strong>{label}</strong> {status}
    </span>
  );
}
