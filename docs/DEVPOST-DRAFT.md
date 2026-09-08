# SetReady AI — Post-Submission Reconciliation

Status: submitted before the September 9, 2026 deadline. Protect the submitted product baseline. Only correct compliance or factual metadata before the deadline; do not reopen product scope.

## Canonical implementation facts

- Project: SetReady AI
- Hosted app: https://setready-ai.vercel.app
- Public repository: https://github.com/aizoya/setready-ai
- Submitted/public video: https://vimeo.com/1224759375
- Partner track: ClickHouse
- Judge-facing browser runtime: Next.js `/api/demo`
- Gemini model in current code: `gemini-2.5-flash`
- ClickHouse integration: official `mcp-clickhouse` runtime over MCP with read-only `run_query`
- Google Cloud: Vertex AI, Cloud Run, Workload Identity Federation / short-lived identity
- Separate managed-agent implementation: Google ADK + Vertex AI Agent Engine under `agent_runtime/`

## Required post-submission corrections before the deadline

### 1. License — owner/legal gate

The repository root `LICENSE` is currently an MIT-style template with unresolved `{{ year }}` and `{{ organization }}` placeholders. Previous documentation called the project Apache-2.0, while the current Vimeo description says MIT Open Source.

Do not claim either license until the repository owner confirms the intended OSI-approved license and installs a complete license file. After that decision, all public metadata should use the same license name.

### 2. Gemini model wording — factual metadata correction

The current repository and judge-facing runtime use Gemini 2.5 Flash. The public Vimeo description currently says Gemini 3.7 / Gemini 3.7 Flash. Correct public metadata and any editable Devpost fields to Gemini 2.5 Flash unless there is separate evidence that the submitted video itself demonstrates another model.

Do not re-record the video solely because of metadata wording. First inspect whether the incorrect model number is only in the Vimeo description / Devpost text or is actually visible/spoken in the submitted video.

### 3. Agent Engine wording — preserve claim boundary

The repository contains a separate Google ADK / Vertex AI Agent Engine implementation. The judge-facing browser golden path directly demonstrates Gemini + ClickHouse MCP through the hosted Next.js runtime. Do not claim that the browser request itself traverses Agent Engine unless that exact path is demonstrated.

## Final copy-paste answer bank

### Project name
SetReady AI

### Tagline
Production intelligence for film and television crews: turn schedule disruptions into evidence-backed, bounded operational recommendations.

### Inspiration
Film and television sets operate under hard constraints: cast availability, crew time, company moves, daylight, location windows, setup dependencies, and budget pressure. When a scene falls behind, the challenge is reasoning quickly from incomplete operational context while preserving human authority and leaving evidence production leadership can inspect.

### What it does
SetReady AI accepts a structured production disruption, validates the input deterministically, queries live runtime evidence through the official ClickHouse MCP server, and asks Gemini for a bounded recommendation designed for a 1st AD / UPM workflow. The recommendation focuses on immediate operational action, schedule/economic risk, and an explicit approval gate. SetReady does not autonomously alter a call sheet or production schedule.

### How we built it
The judge-facing web application is built with Next.js and TypeScript and hosted on Vercel. The `/api/demo` runtime validates the disruption with Zod, initializes an authenticated session with the official ClickHouse MCP server running on Google Cloud Run, executes a live read-only ClickHouse query, obtains short-lived Google Cloud access using Vercel OIDC and Google Workload Identity Federation, and calls Gemini 2.5 Flash through Vertex AI. It returns a bounded recommendation with request-level provider status and runtime evidence.

The repository also includes a separate Google ADK agent runtime under `agent_runtime/`, with Gemini 2.5 Flash, ClickHouse `run_query` exposed through `McpToolset`, and Vertex AI Agent Engine deployment/update code.

### Google Cloud technologies used
- Vertex AI / Gemini 2.5 Flash
- Google Cloud Run
- Google Workload Identity Federation
- Google IAM short-lived service-account access
- Google ADK
- Vertex AI Agent Engine

### Gemini usage
Gemini 2.5 Flash generates the bounded operational recommendation in the hosted workflow using the reported production disruption and live ClickHouse MCP evidence.

### ClickHouse usage
SetReady actively uses ClickHouse at runtime through the official `mcp-clickhouse` server. The hosted demo initializes an authenticated MCP session and invokes `run_query` with a read-only SELECT statement. Captured runtime proof is included in the public repository.

### Agent Engine / Agent Builder usage
The repository contains a Google ADK SetReady agent and Vertex AI Agent Engine deployment/update implementation. The ADK agent uses Gemini 2.5 Flash and exposes the official ClickHouse MCP `run_query` tool through `McpToolset`. The judge-facing browser workflow demonstrates Gemini + ClickHouse MCP directly through the hosted Next.js runtime; do not describe that browser request as traversing Agent Engine unless separately demonstrated.

### Challenges
The hardest work was production-grade identity and runtime integration rather than the interface: Cloud Run MCP transport/startup behavior, authenticated MCP sessions, Vercel environment scoping, Vercel OIDC to Google Workload Identity Federation audience alignment, service-account impersonation, and managed-agent runtime constraints.

### Accomplishments
- Real runtime use of the official ClickHouse MCP server rather than a mocked badge.
- Keyless Vercel-to-Google Cloud authentication through OIDC and Workload Identity Federation.
- Request-level provider proof visible in the product.
- Explicit human authority for consequential schedule changes.
- Separate Google ADK / Vertex AI Agent Engine implementation with a constrained ClickHouse MCP tool boundary.

### What we learned
Agentic production software benefits from separating reasoning from authority. Models can synthesize operational context and propose responses, while deterministic application logic and accountable humans should control validation, permissions, state transitions, and consequential actions. Runtime proof also matters: judges and users should be able to distinguish live integrations from visual placeholders.

### What's next
After the hackathon, expand historical production telemetry and disruption patterns in ClickHouse, add auditable approved state transitions, broaden the 1st AD / UPM workflow, and validate with working film and television production professionals before expanding integrations.

### Built With
Next.js, React, TypeScript, Gemini 2.5 Flash, Vertex AI, Google Cloud Run, Google Workload Identity Federation, Google ADK, Vertex AI Agent Engine, ClickHouse Cloud, official ClickHouse MCP (`mcp-clickhouse`), Model Context Protocol, Zod, Jest, Vercel.

## Links

- Hosted project: https://setready-ai.vercel.app
- Public repository: https://github.com/aizoya/setready-ai
- Submitted/public video: https://vimeo.com/1224759375
- ClickHouse runtime proof: https://github.com/aizoya/setready-ai/blob/main/clickhouse_mcp_runtime_proof.json

## Human-only gates

1. Confirm the intended OSI-approved license and authorize the license correction.
2. Edit Vimeo/Devpost metadata from Gemini 3.7 to Gemini 2.5 Flash where the incorrect claim appears.
3. Verify whether the incorrect model number is visible/spoken inside the submitted video; only consider replacing the video if the error is actually in the video and a clean correction is necessary.
4. Review and save the edited Devpost submission before September 9, 2026 at 2:00 PM Pacific.

## Do not do before the deadline

- No redesign.
- No new feature work.
- No architecture migration.
- No unnecessary new video.
- No change to the working golden path unless a genuine runtime blocker appears.
