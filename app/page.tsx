import DemoClient from "./demo-client";

export default function Home() {
  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">AIZOYA · Agentic Cinema Hackathon</p>
        <h1>SetReady AI</h1>
        <p className="lede">
          Production intelligence for film and television crews. Analyze schedule disruptions,
          understand operational impact, and surface bounded recommendations for the 1st AD and UPM.
        </p>
      </section>

      <section className="panel">
        <div>
          <span className="status">Golden-path demo</span>
          <h2>A scheduled scene is falling behind.</h2>
          <p>
            SetReady validates production context, uses Gemini for analysis, queries live runtime
            evidence through ClickHouse MCP on Google Cloud Run, and returns an actionable recommendation
            with explicit human approval boundaries.
          </p>
        </div>
        <div className="grid">
          <article><strong>Gemini</strong><span>Reasoning & recommendation</span></article>
          <article><strong>Google Cloud</strong><span>Cloud Run MCP runtime</span></article>
          <article><strong>ClickHouse</strong><span>Live production evidence query</span></article>
          <article><strong>Deterministic controls</strong><span>Validation, state & approval gates</span></article>
        </div>
      </section>

      <DemoClient />

      <section className="notice">
        <strong>Runtime proof is explicit.</strong>
        <span>
          Provider badges report verified-live only when that provider succeeds during the current request;
          failures are surfaced rather than silently simulated.
        </span>
      </section>
    </main>
  );
}
