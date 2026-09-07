# SetReady AI — Devpost Submission Draft

> Working draft. Replace bracketed placeholders before final submission. Do not claim a provider or competition requirement unless it is verified in the final deployed build.

## Project name
SetReady AI

## Tagline
Production intelligence for film and television crews: turn schedule disruptions into evidence-backed, bounded operational recommendations.

## Inspiration
Film and television sets operate under hard constraints: cast availability, crew time, company moves, daylight, location windows, setup dependencies, and budget pressure. When a scene falls behind, the problem is not simply “what should we do?” The real problem is how to reason quickly from incomplete operational context, preserve human authority, and leave an evidence trail that production leadership can inspect.

SetReady AI explores an agentic operating model for that moment.

## What it does
SetReady AI accepts a structured production disruption — for example, a scene running 35 minutes behind — validates the input deterministically, queries live runtime evidence through ClickHouse MCP, and asks Gemini for a bounded recommendation designed for a 1st AD / UPM workflow.

The recommendation focuses on:
1. immediate operational action,
2. schedule/economic risk,
3. an explicit approval gate.

SetReady does not autonomously alter a call sheet or production schedule. Human production leadership remains the authority for consequential changes.

## How we built it
### Application
- Next.js + TypeScript hosted on Vercel
- deterministic input validation and provider-state reporting
- mobile-first golden-path UI

### Gemini + Google Cloud
- Gemini called through the Vertex AI API
- Vercel OIDC exchanged through Google Workload Identity Federation
- short-lived access through a dedicated SetReady Runtime service account
- no long-lived Google service-account key committed to the application

### ClickHouse partner-track integration
- official ClickHouse MCP server deployed on Google Cloud Run
- authenticated MCP session initialized at runtime
- live read-only ClickHouse query executed during the demo request
- response included as runtime evidence before Gemini produces the recommendation

### Reliability / control model
- provider badges report `verified-live` only after that provider succeeds during the current request
- failures are surfaced rather than silently mocked
- input bounds are deterministic
- ClickHouse demo query is read-only
- schedule changes remain behind a human approval boundary

## Runtime architecture
```text
SetReady UI (Vercel)
        |
        v
Next.js /api/demo
  | deterministic validation
  |
  +--> ClickHouse MCP / Google Cloud Run
  |      `--> live ClickHouse query
  |
  `--> Vercel OIDC
         `--> Google Workload Identity Federation
                `--> SetReady Runtime service account
                       `--> Vertex AI / Gemini

Result: recommendation + live provider badges + runtime evidence
```

## What we verified
In the deployed golden-path demo, a single request has produced:
- `ClickHouse verified-live`
- `Gemini verified-live`
- live ClickHouse runtime evidence
- a Gemini-generated operational recommendation
- visible deterministic control boundaries

## Challenges we ran into
The most difficult work was production-grade identity and runtime wiring rather than the UI. We had to solve:
- Cloud Run transport/startup behavior for the MCP server,
- Secret Manager access and credential synchronization,
- authenticated MCP session handling,
- Vercel environment scoping,
- Vercel OIDC → Google Workload Identity Federation audience alignment,
- preview/production attribute conditions,
- service-account impersonation permissions.

We kept those failures explicit in the product during development instead of displaying fake “connected” states.

## Accomplishments we are proud of
- Real ClickHouse MCP integration rather than a mocked partner badge.
- Keyless Vercel-to-Google Cloud authentication using OIDC/WIF.
- Request-level provider proof visible in the product.
- A narrow, production-operations workflow instead of an over-broad film-management prototype.
- Explicit human authority for consequential schedule changes.

## What we learned
Agentic production software needs a separation between reasoning and authority. Models are useful for synthesizing operational context and proposing responses; deterministic application logic and accountable humans should control permissions, state transitions, and consequential actions.

We also learned that runtime proof matters. A judge or production user should be able to distinguish a live provider integration from a visual placeholder.

## What's next
- Add richer historical production telemetry and disruption patterns in ClickHouse.
- Add approved production state transitions and auditable event writes.
- Expand the 1st AD / UPM workflow to company moves, hard outs, setup dependencies, and recovery scenarios.
- Add controlled integrations with production scheduling and communication systems.
- Validate with working film/TV production professionals before broadening scope.

## Links
- Hosted app: https://setready-ai.vercel.app
- Public repository: https://github.com/aizoya/setready-ai
- Demo video: [ADD FINAL VIDEO URL]

## License
Apache License 2.0.

## Final submission QA — must complete before submit
- [ ] PR #3 merged to `main`
- [ ] production deployment rerun shows both providers `verified-live`
- [ ] public repo displays Apache-2.0 license
- [ ] README reflects final architecture
- [ ] no secrets in repository/history/screenshots/video
- [ ] 3-minute video uploaded and URL inserted
- [ ] verify final competition wording for Google Cloud Agent Builder / required Google services and document only what is actually used
- [ ] verify Devpost fields, partner track selection, and submission deadline
