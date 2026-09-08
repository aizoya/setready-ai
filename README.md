# SetReady AI

SetReady AI is an AI production-intelligence agent for film and television crews, built for Agentic Cinema: The Blockbuster Hackathon.

## What it does

A production disruption is reported, SetReady validates the structured input, queries live evidence from ClickHouse through the official ClickHouse MCP server, asks Gemini for a bounded operational recommendation, and keeps consequential schedule changes behind explicit 1st AD / UPM human review.

## Judge-facing hosted demo

https://setready-ai.vercel.app

The current web golden path uses the Next.js `/api/demo` route. A successful request shows request-level provider proof for both ClickHouse and Gemini and returns the recommendation without simulating provider success.

## Architecture

```text
SetReady UI (Vercel)
        |
        v
Next.js /api/demo
  | deterministic Zod validation
  |
  +--> Official ClickHouse MCP server on Google Cloud Run
  |      `--> ClickHouse Cloud read-only runtime query
  |
  `--> Vercel OIDC
         `--> Google Workload Identity Federation
                `--> dedicated Google Cloud service account
                       `--> Vertex AI / Gemini 2.5 Flash

Result: recommendation + provider status + runtime evidence + human approval boundary
```

A separate Google ADK runtime is also included under `agent_runtime/`. It defines the SetReady agent with Gemini 2.5 Flash, exposes only ClickHouse `run_query` through `McpToolset`, and contains the managed Vertex AI Agent Engine deployment/update scaffold. The judge-facing web request path remains the `/api/demo` architecture shown above; this README does not claim that the browser request is routed through Agent Engine.

## Key components

1. **Next.js 15 / React 19** — hosted web application and API routes.
2. **Gemini 2.5 Flash on Vertex AI** — runtime reasoning and recommendation generation.
3. **Google Cloud authentication** — Vercel OIDC → Google Workload Identity Federation → short-lived service-account access.
4. **Official ClickHouse MCP** — live runtime access to ClickHouse through `mcp-clickhouse` on Google Cloud Run.
5. **SQL safety controls** — SELECT-only validation, approved-table allowlist, forbidden-keyword checks, and query limits in the agent route.
6. **Deterministic validation and state controls** — Zod schemas and explicit workflow boundaries.
7. **Human review** — recommendations are advisory; consequential production schedule changes are not automatically executed.
8. **Google ADK / Vertex AI Agent Engine scaffold** — managed-agent implementation under `agent_runtime/`.

## ClickHouse partner-track runtime proof

The submitted implementation actively uses ClickHouse at runtime through the official ClickHouse MCP server. The web golden path performs an authenticated MCP initialization and `tools/call` for `run_query` using a read-only `SELECT` query.

A captured verification trace is available in [`clickhouse_mcp_runtime_proof.json`](./clickhouse_mcp_runtime_proof.json).

| Timestamp (UTC) | MCP event | Tool | Status |
| --- | --- | --- | --- |
| `2026-09-07T18:33:21Z` | `initialize` | system | SUCCESS |
| `2026-09-07T18:33:22Z` | `tools/list` | system | SUCCESS |
| `2026-09-07T18:33:22Z` | `tools/call` | `run_query` | SUCCESS |

## Safety and security

- Disruption inputs are validated before provider calls.
- Runtime ClickHouse queries used in the judge-facing demo are read-only.
- The separate agent route includes deterministic SELECT-only SQL validation and limits.
- Provider badges show `verified-live` only when that provider succeeds in the current request.
- Failures are surfaced instead of silently mocked.
- Human production leadership retains authority over consequential schedule changes.
- Credential values must remain in deployment secret/configuration systems and must never be committed or logged.

## Environment variables

See `.env.example` for names only. The hosted runtime uses deployment-managed configuration and keyless Google Cloud identity; do not commit credential values or service-account keys.

## Run locally

```bash
npm ci
npm test -- --runInBand
npm run build
npm run dev
```

Local provider calls require the deployment-specific Google Cloud and ClickHouse configuration documented in `.env.example`.

## Project structure

- `app/page.tsx` — SetReady landing page.
- `app/demo-client.tsx` — judge-facing disruption workflow.
- `app/api/demo/route.ts` — hosted ClickHouse MCP + Gemini runtime path.
- `app/api/agent/route.ts` — guarded agent/SQL workflow implementation.
- `agent_runtime/agent.py` — Google ADK SetReady agent with ClickHouse MCP toolset.
- `agent_runtime/deploy_agent_engine.py` — Vertex AI Agent Engine deployment/update scaffold.
- `lib/mcp-client.ts` — MCP client wrapper.
- `lib/sql-safety.ts` — deterministic SQL guardrail.
- `lib/state-machine.ts` — workflow transition policy.
- `lib/types.ts` — Zod schemas and shared types.
- `__tests__/` — automated tests.
- `docs/DEMO-SCOPE.md` — frozen hackathon scope.
- `docs/DEMO-SCRIPT.md` — submitted demo-video runbook.
- `docs/DEVPOST-DRAFT.md` — post-submission reconciliation and answer bank.

## Submission integrity

The repository is public and the scope is frozen for submission. Runtime integrations should be described only to the extent supported by code and captured verification evidence.

## License

SetReady AI is released under the **MIT License**. See [`LICENSE`](./LICENSE).
