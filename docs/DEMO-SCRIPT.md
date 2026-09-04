# SetReady AI — 3-Minute Demo Script

## Goal
Show one complete, truthful golden-path run in under three minutes while making the Google Cloud, Gemini, and ClickHouse runtime integrations obvious to judges.

## Recording setup
- Use the verified hosted SetReady deployment.
- Start with the form already visible.
- Keep the browser zoom and text large enough for mobile/video playback.
- Do not expose environment variables, tokens, passwords, Secret Manager values, or IAM policy details.
- Record one clean take after confirming both providers are healthy.

## 0:00–0:20 — Problem
**On screen:** SetReady AI title and golden-path demo.

**Narration:**
“Film and television crews lose time and money when a scene falls behind and operational decisions have to be made quickly. SetReady AI is a production-intelligence agent that turns a disruption into a bounded recommendation for the 1st AD and UPM, while keeping schedule-changing authority with humans.”

## 0:20–0:45 — Input
**On screen:** Scene, delay, and cause fields.

Use the default scenario:
- Scene 42A — exterior dialogue
- 35-minute delay
- Lighting reset and company move ran long

**Narration:**
“This scenario reports a 35-minute delay on an exterior dialogue scene. SetReady validates the structured input before any provider call.”

## 0:45–1:20 — Run live analysis
**On screen:** Click **Run live analysis**.

**Narration while it runs:**
“The request performs two live provider operations. First, SetReady opens an authenticated MCP session with the official ClickHouse MCP server running on Google Cloud Run and executes a read-only ClickHouse query. Then it authenticates from Vercel to Google Cloud with OIDC and Workload Identity Federation and asks Gemini for a bounded operational recommendation.”

## 1:20–1:50 — Provider proof
**On screen:** Show both green badges.

Expected:
- `ClickHouse verified-live`
- `Gemini verified-live`

**Narration:**
“These badges are request-level proof. SetReady labels a provider verified-live only when that provider succeeds during the current request. If a provider fails, the UI surfaces the failure instead of simulating success.”

## 1:50–2:25 — Recommendation
**On screen:** Recommendation text.

**Narration:**
“Gemini returns a concise recommendation covering immediate action, schedule or economic risk, and an approval gate. The recommendation is evidence-informed, but SetReady does not autonomously change the schedule.”

## 2:25–2:45 — Deterministic controls
**On screen:** Deterministic controls panel.

**Narration:**
“Deterministic controls keep the agent bounded: inputs are validated before provider calls, the ClickHouse demo query is read-only, and production schedule changes require human approval.”

## 2:45–3:00 — Runtime evidence and close
**On screen:** Briefly expand **Runtime evidence** and show the live provider statuses/evidence without dwelling on raw JSON.

**Narration:**
“SetReady combines Gemini reasoning, Google Cloud identity and runtime infrastructure, and live ClickHouse evidence into one auditable production-operations workflow. This is the focused foundation for a larger production-intelligence system.”

## Recording acceptance checklist
- Both provider badges green in the recorded run.
- No secrets visible.
- Recommendation readable.
- Runtime evidence briefly visible.
- Human approval boundary mentioned.
- Final video <= 3:00.
- Export at a readable resolution with clear audio.
