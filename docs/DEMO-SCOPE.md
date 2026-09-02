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
4. Gemini analyzes the production context and generates a bounded operational assessment.
5. ClickHouse provides/stores runtime production telemetry and evidence.
6. SetReady returns an actionable recommendation for the AD/UPM with evidence visible in the UI.
7. The user confirms/records the recommended response where an action requires confirmation.

## Authority boundary
The model may reason, summarize, classify, and recommend. Application logic owns validation, permissions, state transitions, writes, confirmation evidence, idempotency, and audit records.

## Demo success criteria
- End-to-end workflow works from the hosted UI.
- Gemini use is runtime-verifiable.
- Google Cloud use is runtime-verifiable.
- Google Cloud Agent Builder use is runtime-verifiable if required by the final competition rules.
- ClickHouse integration is real at runtime, not a visual placeholder.
- Provider/integration status can be demonstrated without exposing secrets.
- Failure states degrade gracefully.
- Mobile layout is usable.
- Demo can be completed reliably inside three minutes.

## Scope freeze
Do not add features unless they materially improve the golden-path demo, competition compliance, reliability, evidence, or submission quality.

## Submission evidence
Final README/submission should include architecture, setup instructions, environment-variable names (never values), hosted app link, public repository link, partner-track explanation, screenshots/evidence where useful, and demo video link.
