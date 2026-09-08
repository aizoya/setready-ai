# SetReady AI — Final Demo Video Runbook

## Target
Record a truthful **2:40–2:50** demo, leaving at least 10 seconds of buffer under the 3:00 judging limit. The video must show the real hosted application functioning, not slides or a mockup.

## Recording setup
- Open the canonical hosted app: `https://setready-ai.vercel.app`.
- Start with the default disruption scenario already visible.
- Use readable browser zoom and clear audio.
- Do not show environment variables, tokens, passwords, Secret Manager values, IAM policy details, terminals, or private dashboards.
- Run the live workflow once immediately before recording; record only when the hosted path is healthy.
- The recorded run should show both `ClickHouse verified-live` and `Gemini verified-live`.

## 0:00–0:18 — Problem
**Screen:** SetReady AI title and golden-path panel.

**Narration:**
“Film and television crews lose time and money when a scene falls behind and production leaders have to make operational decisions quickly. SetReady AI turns a disruption into an evidence-backed recommendation for the 1st AD and UPM while keeping consequential schedule authority with humans.”

## 0:18–0:38 — Structured disruption
**Screen:** Show the default form values:
- Scene 42A — exterior dialogue
- 35-minute delay
- Lighting reset and company move ran long

**Narration:**
“This example reports a 35-minute delay on an exterior dialogue scene. SetReady validates the structured event before any provider call.”

## 0:38–1:15 — Run the real workflow
**Screen action:** Click **Run live analysis**. Keep the loading state visible until the result appears.

**Narration:**
“The hosted request opens an authenticated session with the official ClickHouse MCP server running on Google Cloud Run and executes a live read-only ClickHouse query. In the same workflow, Vercel exchanges OIDC identity through Google Workload Identity Federation for short-lived Google Cloud access, then calls Gemini 2.5 Flash on Vertex AI for a bounded operational recommendation.”

## 1:15–1:40 — Runtime proof
**Screen:** Hold on the provider badges.

Expected:
- `ClickHouse verified-live`
- `Gemini verified-live`

**Narration:**
“These are request-level proof badges. A provider is labeled verified-live only when it succeeds during this request. SetReady surfaces failures instead of displaying a fake connected state.”

## 1:40–2:10 — Recommendation and human authority
**Screen:** Scroll only enough to keep the recommendation readable.

**Narration:**
“Gemini returns a concise operational recommendation grounded in the reported disruption and live runtime evidence. SetReady does not automatically alter the call sheet or production schedule. The 1st AD and UPM remain the decision authority.”

## 2:10–2:30 — Deterministic controls
**Screen:** Show the deterministic controls list.

**Narration:**
“Deterministic controls keep the workflow bounded: inputs are validated before provider calls, the ClickHouse runtime query is read-only, and consequential schedule changes require human production approval.”

## 2:30–2:47 — Evidence and close
**Screen action:** Expand **Runtime evidence** briefly; show provider status/evidence without dwelling on raw data.

**Narration:**
“SetReady combines Gemini reasoning, Google Cloud identity and runtime infrastructure, and the official ClickHouse MCP into one auditable production-operations workflow. It is a focused foundation for faster, safer production decisions.”

## Acceptance checklist
- Final exported duration: **2:40–2:50 preferred; never over 3:00**.
- Hosted application is visibly functioning.
- Both provider badges are green in the recorded run.
- Recommendation is readable.
- Runtime evidence is shown briefly.
- Gemini, Google Cloud, and official ClickHouse MCP are named accurately.
- Human approval boundary is stated.
- No secrets/private dashboards are visible.
- English narration or English subtitles.
- Upload to YouTube or Vimeo and make the video publicly visible.
