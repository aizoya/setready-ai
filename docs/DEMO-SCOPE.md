# SetReady AI — Hackathon Demo Scope

## Submission target
Agentic Cinema — The Blockbuster Hackathon
Deadline: September 9, 2026 at 2:00 PM PDT

## Product thesis
SetReady AI is a production-intelligence agent for film and television crews. The hackathon build intentionally proves one high-value workflow instead of attempting a complete production-management platform.

## Golden path
1. A production disruption is reported (for example, a scheduled scene is falling behind).
2. SetReady receives structured production context.
3. Deterministic application logic validates the event and allowed workflow transition.
4. SetReady queries live ClickHouse runtime evidence through the official ClickHouse MCP server on Google Cloud Run.
5. SetReady authenticates to Google Cloud through Vercel OIDC + Workload Identity Federation and asks Gemini for a bounded operational assessment.
6. SetReady returns an actionable recommendation for the 1st AD / UPM with request-level provider proof and evidence visible in the UI.
7. Any consequential schedule change remains subject to human production approval.

## Authority boundary
The model may reason, summarize, classify, and recommend. Application logic owns validation, provider-state reporting, and the control boundary. Human production leadership owns consequential schedule decisions.

## Verified success criteria — September 3, 2026
- ✅ End-to-end workflow works from the hosted UI.
- ✅ Gemini use is runtime-verifiable in the same request.
- ✅ Google Cloud identity/runtime use is runtime-verifiable.
- ✅ ClickHouse integration is real at runtime, not a visual placeholder.
- ✅ ClickHouse MCP runs on Google Cloud Run.
- ✅ Provider/integration status can be demonstrated without exposing secrets.
- ✅ Failure states were surfaced during integration rather than silently simulated.
- ✅ Mobile layout is usable.
- ✅ Golden-path run is short enough for a three-minute demo.

## Competition-compliance item still to verify before final submission
Confirm the final competition wording for Google Cloud Agent Builder / required Google agent-platform services and document only what the deployed application actually uses. Do not add a visual or textual claim merely to satisfy wording; runtime evidence must support the claim.

## Scope freeze
Do not add features unless they materially improve competition compliance, reliability, evidence, final-demo clarity, or submission quality.

## Submission evidence
Final README/submission should include:
- architecture and control boundary,
- environment-variable names (never values),
- hosted app link,
- public repository link,
- Apache-2.0 license,
- ClickHouse partner-track explanation,
- Gemini/Google Cloud authentication explanation,
- screenshots/evidence where useful,
- <=3-minute demo video link.

## Release gate
Do not merge/promote solely because the feature works once. Before release:
1. latest documentation build is green,
2. preview smoke test still shows both providers `verified-live`,
3. merge is explicitly approved,
4. production deployment is smoke-tested before video/submission links are finalized.
