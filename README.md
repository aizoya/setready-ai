# SetReady AI

SetReady AI is an AI production-intelligence agent for film and television crews, built for **Agentic Cinema — The Blockbuster Hackathon** in the **ClickHouse** partner track.

## What it does

SetReady converts a live production disruption into a bounded, evidence-backed recommendation for a 1st AD / UPM while preserving deterministic controls around validation and persistence.

Golden path:

**Production disruption → deterministic validation → Gemini Enterprise Agent Platform interaction → official ClickHouse MCP historical-context query → bounded recommendation → deterministic ClickHouse evidence write → visible runtime proof.**

## Required hackathon runtime

SetReady is designed so the qualifying services execute in the runtime path rather than being named only in documentation:

- **Gemini / Google Cloud:** `@google/genai` invokes the Gemini Enterprise Agent Platform Managed Agents Interactions API.
- **Google Cloud Agent Builder / Agent Platform:** a managed agent performs the analysis and orchestration.
- **ClickHouse MCP:** the managed agent receives the official `mcp-clickhouse` server as an MCP tool and is instructed to query production history before answering.
- **ClickHouse:** deterministic audit evidence is persisted to a ClickHouse `setready_events` table after the agent run succeeds.
- **Next.js + TypeScript:** hosted application and visible evidence layer.

The API intentionally fails the run if the ClickHouse MCP tool is not observed in the Agent Platform interaction. This prevents the UI from claiming partner-track verification when the required runtime tool did not execute.

## Runtime boundary

The agent is advisory. It must not make safety-critical, legal, union, or personnel decisions. It produces:

- impact assessment
- one bounded recommendation
- explicit assumptions
- an escalation trigger

Deterministic application code owns input validation, ClickHouse table management, evidence persistence, and success/failure state.

## Environment

Copy `.env.example` to `.env.local` for development. Never commit credentials.

Required application values:

- `GOOGLE_CLOUD_PROJECT`
- `GOOGLE_AGENT_ID` — recommended custom SetReady agent; the preview base agent is a development fallback
- `CLICKHOUSE_HOST`
- `CLICKHOUSE_DATABASE`
- `CLICKHOUSE_USERNAME`
- `CLICKHOUSE_PASSWORD`
- `CLICKHOUSE_MCP_URL` — URL for the official ClickHouse MCP server
- `CLICKHOUSE_MCP_AUTH_TOKEN` — when the remote MCP service uses static bearer authentication

Google Cloud authentication must be provided through the deployment platform's supported credential mechanism. The intended production design uses short-lived/federated credentials rather than a committed service-account key.

## ClickHouse MCP

The competition requires active runtime use of the official ClickHouse MCP server. SetReady therefore does **not** treat the direct `@clickhouse/client` connection as satisfying the partner requirement.

Recommended options:

1. Enable the official remote MCP capability on the selected ClickHouse Cloud service when available, or
2. Deploy the official `ClickHouse/mcp-clickhouse` server with authenticated HTTP transport and point `CLICKHOUSE_MCP_URL` at its `/mcp` endpoint.

The MCP identity should be read-only/minimum-privilege. Deterministic application credentials may have narrowly scoped write access to the SetReady evidence table.

## Local commands

```bash
npm install
npm run dev
npm run build
```

## Submission verification gate

Do not merge/deploy as the final submission build until one end-to-end run proves all of the following:

1. Google Cloud authentication succeeds.
2. Gemini Enterprise Agent Platform starts an interaction.
3. The official ClickHouse MCP tool is invoked at runtime.
4. The agent returns the bounded SetReady recommendation.
5. The evidence row is written to ClickHouse.
6. The UI displays Agent Platform, interaction, MCP, ClickHouse-write, and latency evidence.
7. The hosted URL works on mobile and desktop.

The 3-minute demo should capture the full verified flow because the hackathon organizers have stated that the demo video serves as the backstop if cloud credits later expire.

## License

See `LICENSE` in the repository root.
