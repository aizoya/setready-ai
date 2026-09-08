# SetReady AI — Final Devpost Answer Bank

Use only claims that match the current repository and hosted runtime. Replace the final video placeholder after upload. Do not label the current root license Apache-2.0 until the repository owner has corrected or confirmed the intended complete OSI-approved license.

## Project name
SetReady AI

## Tagline
Production intelligence for film and television crews: turn schedule disruptions into evidence-backed, bounded operational recommendations.

## Partner track
ClickHouse

## Inspiration
Film and television sets operate under hard constraints: cast availability, crew time, company moves, daylight, location windows, setup dependencies, and budget pressure. When a scene falls behind, the problem is not simply “what should we do?” The real challenge is reasoning quickly from incomplete operational context, preserving human authority, and leaving an evidence trail that production leadership can inspect.

SetReady AI explores an agentic operating model for that moment.

## What it does
SetReady AI accepts a structured production disruption — for example, a scene running 35 minutes behind — validates the input deterministically, queries live runtime evidence through the official ClickHouse MCP server, and asks Gemini for a bounded recommendation designed for a 1st AD / UPM workflow.

The recommendation focuses on immediate operational action, schedule/economic risk, and an explicit approval gate. SetReady does not autonomously alter a call sheet or production schedule. Human production leadership remains the authority for consequential changes.

## How we built it
The judge-facing web application is built with Next.js and TypeScript and hosted on Vercel. The `/api/demo` runtime validates the disruption with Zod, initializes an authenticated session with the official ClickHouse MCP server running on Google Cloud Run, executes a live read-only ClickHouse query, and then obtains short-lived Google Cloud access using Vercel OIDC and Google Workload Identity Federation. It calls Gemini 2.5 Flash through Vertex AI and returns a bounded operational recommendation with request-level provider status and runtime evidence.

The repository also includes a separate Google ADK agent runtime under `agent_runtime/`. That implementation defines the SetReady agent with Gemini 2.5 Flash, exposes only ClickHouse `run_query` through `McpToolset`, and includes the Vertex AI Agent Engine deployment/update scaffold. The browser golden path is not described as routing through Agent Engine unless that path is explicitly demonstrated.

## Google Cloud technologies used
- Vertex AI / Gemini 2.5 Flash
- Google Cloud Run for the ClickHouse MCP runtime
- Google Workload Identity Federation
- Google IAM service-account impersonation / short-lived credentials
- Google ADK in the separate agent runtime
- Vertex AI Agent Engine deployment/update scaffold in `agent_runtime/`

## Gemini usage
Gemini 2.5 Flash generates the bounded operational recommendation in the hosted web workflow. The runtime prompt includes the reported production disruption and live ClickHouse MCP evidence and instructs the model not to invent unsupplied crew, cast, labor, weather, safety, or budget facts.

## ClickHouse usage
SetReady actively uses ClickHouse at runtime through the official `mcp-clickhouse` server, satisfying the ClickHouse partner-track integration model. The hosted demo initializes an authenticated MCP session and calls `run_query` with a read-only `SELECT` statement against a live ClickHouse deployment. A captured runtime proof file is included in the public repository.

## Agent Engine / Agent Builder usage
The repository contains a Google ADK SetReady agent and Vertex AI Agent Engine deployment/update implementation. The ADK agent uses Gemini 2.5 Flash and exposes the official ClickHouse MCP `run_query` tool through `McpToolset`. A managed Agent Engine resource was created during the build and the query guard was subsequently constrained to a read-only runtime verification query. The judge-facing browser workflow currently demonstrates Gemini + ClickHouse MCP directly through the hosted Next.js runtime; do not claim that the browser request itself traverses Agent Engine unless the recorded demo proves that exact path.

## Runtime architecture
```text
SetReady UI (Vercel)
        |
        v
Next.js /api/demo
  | deterministic validation
  |
  +--> official ClickHouse MCP / Google Cloud Run
  |      `--> live ClickHouse read-only query
  |
  `--> Vercel OIDC
         `--> Google Workload Identity Federation
                `--> dedicated Google Cloud service account
                       `--> Vertex AI / Gemini 2.5 Flash

Result: recommendation + provider badges + runtime evidence + human approval boundary
```

Separate managed-agent implementation:
```text
Google ADK SetReady agent
   +--> Gemini 2.5 Flash
   +--> McpToolset -> official ClickHouse MCP run_query
   `--> Vertex AI Agent Engine deployment/update scaffold
```

## Challenges we ran into
The hardest work was production-grade identity and runtime integration rather than the interface. We had to resolve Cloud Run MCP transport/startup behavior, Secret Manager access and credential synchronization, authenticated MCP session handling, Vercel environment scoping, Vercel OIDC to Google Workload Identity Federation audience alignment, service-account impersonation permissions, and managed-agent runtime constraints.

We kept failures explicit during development instead of displaying fake connected states.

## Accomplishments we are proud of
- Real runtime use of the official ClickHouse MCP server rather than a mocked partner badge.
- Keyless Vercel-to-Google Cloud authentication using OIDC and Workload Identity Federation.
- Request-level provider proof visible in the product.
- A focused production-operations workflow instead of an over-broad film-management prototype.
- Explicit human authority for consequential schedule changes.
- A separate Google ADK / Vertex AI Agent Engine implementation with a constrained ClickHouse MCP tool boundary.

## What we learned
Agentic production software benefits from separating reasoning from authority. Models can synthesize operational context and propose responses, while deterministic application logic and accountable humans should control validation, permissions, state transitions, and consequential production actions.

We also learned that runtime proof matters. A judge or production user should be able to distinguish a live provider integration from a visual placeholder.

## What’s next
After the hackathon, we would expand historical production telemetry and disruption patterns in ClickHouse, add auditable approved state transitions, broaden the 1st AD / UPM workflow to company moves and setup dependencies, and validate the product with working film and television production professionals before expanding integrations.

## Built With
- Next.js
- React
- TypeScript
- Gemini 2.5 Flash
- Vertex AI
- Google Cloud Run
- Google Workload Identity Federation
- Google ADK
- Vertex AI Agent Engine
- ClickHouse Cloud
- official ClickHouse MCP (`mcp-clickhouse`)
- Model Context Protocol
- Zod
- Jest
- Vercel

## Links
- Hosted project: https://setready-ai.vercel.app
- Public repository: https://github.com/aizoya/setready-ai
- Demo video: [ADD FINAL PUBLIC YOUTUBE OR VIMEO URL]
- ClickHouse runtime proof: https://github.com/aizoya/setready-ai/blob/main/clickhouse_mcp_runtime_proof.json

## Submission notes
- Competition deadline: September 9, 2026 at 2:00 PM Pacific.
- Video: public YouTube or Vimeo; English or English subtitles; no longer than 3 minutes; must show the functioning project.
- Repository: public, runnable instructions/source included, runtime Google Cloud + partner use visible in code, and a complete detectable OSI-approved license.
- Partner track: ClickHouse.
- Screenshots/images are useful for presentation but are not listed as a core competition submission requirement in the published rules.

## Final pre-submit gates
- [ ] Repository owner corrects/confirms the intended complete OSI-approved root `LICENSE` file and removes template placeholders.
- [ ] Fresh hosted smoke test shows the judge-facing golden path working and both provider badges `verified-live`.
- [ ] Final demo video recorded at 2:40–2:50 target duration.
- [ ] Video uploaded to YouTube or Vimeo and made publicly visible.
- [ ] Final video URL inserted into Devpost.
- [ ] Devpost project/team information is complete; if entering as a team or organization, all eligible members are added and the representative is authorized.
- [ ] Final owner review and Submit before September 9, 2026 at 2:00 PM Pacific.
