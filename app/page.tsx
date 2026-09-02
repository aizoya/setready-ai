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
            SetReady will validate production context, use Gemini for analysis, query/store runtime
            evidence in ClickHouse, and return an actionable recommendation with an audit trail.
          </p>
        </div>
        <div className="grid">
          <article><strong>Gemini</strong><span>Reasoning & recommendation</span></article>
          <article><strong>Google Cloud</strong><span>Agent runtime & orchestration</span></article>
          <article><strong>ClickHouse</strong><span>Production telemetry & evidence</span></article>
          <article><strong>Deterministic controls</strong><span>Validation, state & writes</span></article>
        </div>
      </section>

      <section className="notice">
        <strong>Foundation deployed.</strong>
        <span>Live provider integrations are not yet configured; no runtime claim is made until verified.</span>
      </section>
    </main>
  );
}
