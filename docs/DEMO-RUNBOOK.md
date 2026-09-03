# SetReady AI — 3-Minute Demo Runbook

Goal: demonstrate a real end-to-end SetReady runtime, not a cinematic trailer.

## Recording prerequisites

Do not record the final demo until the hosted preview visibly proves:

- Agent Platform interaction succeeds
- official ClickHouse MCP server is invoked
- recommendation returns
- ClickHouse evidence write succeeds
- runtime evidence panel is visible

Use the hosted application and keep the browser zoom/readability mobile-friendly.

## 0:00–0:20 — Problem

Show the SetReady AI home screen.

Narration points:
- Film and TV sets lose time and money when production disruptions cascade into actor hard-outs, company moves, lighting resets, and downstream schedule pressure.
- SetReady gives the 1st AD / UPM a bounded operational recommendation grounded in current disruption data and recent production history.

## 0:20–0:45 — Architecture

Point to the technology cards.

Narration points:
- The workflow is orchestrated through Gemini Enterprise Agent Platform / Google Cloud Agent Builder.
- The managed agent uses the official ClickHouse MCP server at runtime to inspect relevant production history.
- Deterministic application code owns validation and audit persistence so the model does not control state transitions or writes.

## 0:45–1:20 — Enter disruption

Use the prepared Harbor Lights example:

- Production: Harbor Lights
- Scene: 42B
- Minutes behind: 35
- Cause: Lighting reset is taking longer than planned after a location power issue.
- Next constraint: Lead actor has a hard out in 95 minutes and the next setup requires a 25-minute company move.

Explain that this is the production context the 1st AD might need to triage quickly.

## 1:20–2:05 — Run SetReady

Click **Run SetReady analysis**.

While it runs, explain the actual runtime sequence:

1. deterministic input validation
2. Agent Platform interaction starts
3. managed agent receives official ClickHouse MCP as a tool
4. agent queries recent `setready_events` context
5. Gemini produces a bounded recommendation
6. application writes evidence to ClickHouse

Do not claim any step until the UI confirms it.

## 2:05–2:35 — Show result and evidence

Read only the most important sentence from the recommendation.

Then show the evidence panel and call out:

- Agent Platform: verified
- Agent identifier
- interaction identifier
- ClickHouse MCP: `mcp-clickhouse`
- ClickHouse evidence write: confirmed
- runtime latency

This is the strongest technical proof in the demo.

## 2:35–2:55 — Why it matters

Narration points:
- SetReady is intentionally narrow: it assists operational decision-making rather than replacing production leadership.
- It does not make safety-critical, legal, union, or personnel decisions.
- The same architecture can later expand to call sheets, company moves, weather disruptions, equipment delays, location constraints, and cross-department coordination.

## 2:55–3:00 — Close

Close with:

"SetReady AI turns production disruption into auditable production intelligence — powered by Gemini Enterprise Agent Platform and ClickHouse MCP."

## Recording QA

Before upload:

- total length <= 3:00
- English narration or English subtitles
- hosted app visibly functioning
- no secret values, tokens, project credentials, or cloud-console sensitive data visible
- repo URL and hosted URL confirmed separately in Devpost
- video is publicly viewable on YouTube or Vimeo
