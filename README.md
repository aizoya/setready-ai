# SetReady AI

SetReady AI is an AI production-intelligence agent for film and television crews, built for the Agentic Cinema — The Blockbuster Hackathon.

## Architecture

The current clean-room build uses a Google Cloud Vertex AI runtime with **Gemini 2.5 Flash**, plus a ClickHouse MCP connection for production context retrieval.

### Golden Path

Production disruption → deterministic input validation → Gemini-generated read-only SQL → SQL safety validation → ClickHouse MCP context retrieval → Gemini recommendation → human approve/reject decision in the UI.

### Key Components

1. **Next.js App Router** — frontend and API route.
2. **Gemini 2.5 Flash** — runtime reasoning through `@google-cloud/vertexai`.
3. **MCP (Model Context Protocol)** — official SDK integration for ClickHouse connectivity.
4. **SQL Safety Layer** — SELECT-only validation, table allowlist, forbidden-keyword checks, and enforced query limits.
5. **Deterministic State Machine Module** — explicit allowed transitions for the SetReady workflow, with unit coverage.
6. **Zod Validation** — strict input and recommendation schemas.
7. **Human Review UI** — recommendations are presented for explicit approval or rejection; approval does not trigger an external production action.

### Tech Stack

- **Frontend**: React 19, Next.js 15, Lucide Icons.
- **Backend**: Next.js 15 API routes.
- **AI**: Gemini 2.5 Flash via `@google-cloud/vertexai`.
- **Database Access**: MCP SDK via `@modelcontextprotocol/sdk`.
- **Testing**: Jest, ts-jest, React Testing Library.

## Safety & Security

- **Input validation**: disruption payloads are validated before external calls.
- **SQL defense**:
  - only `SELECT` statements are allowed;
  - approved tables are `production_schedule` and `setready_events`;
  - semicolons and DML/DDL/SYSTEM-style keywords are rejected;
  - query results are capped with `LIMIT 100`.
- **Read-only expectation**: the ClickHouse identity used by the MCP server must also be configured read-only at the database layer.
- **Human control**: the current demo presents a recommendation for approval/rejection and does not automatically execute a production action.
- **Secret handling**: environment variable names may be documented; credential values must never be committed or logged.

## Environment Variables

Copy `.env.example` to `.env.local` for local development and configure values through your local/deployment secret mechanism:

- `GOOGLE_CLOUD_PROJECT`: Google Cloud project ID.
- `GOOGLE_CLOUD_LOCATION`: Vertex AI location. The app maps `global`/unset to `us-central1` for the current SDK path.
- `MCP_CLICKHOUSE_URL`: base URL for the ClickHouse MCP server.
- `MCP_SERVER_AUTH_TOKEN`: bearer token for the MCP server when authentication is enabled.

Google Cloud authentication for `@google-cloud/vertexai` should be provided through Application Default Credentials or the deployment platform's supported Google Cloud identity mechanism. Do not place service-account keys in the repository.

## Getting Started

1. `npm install`
2. Configure the environment variables above.
3. `npm run dev`
4. `npm test`
5. `npm run build`

## Project Structure

- `app/api/agent/route.ts` — core request, Gemini, SQL-safety, and ClickHouse MCP flow.
- `app/page.tsx` — film/TV disruption demo and human review interface.
- `lib/mcp-client.ts` — MCP transport/client wrapper.
- `lib/sql-safety.ts` — deterministic SQL guardrail.
- `lib/state-machine.ts` — workflow transition policy.
- `lib/types.ts` — Zod schemas and shared types.
- `__tests__/` — automated unit tests.
- `docs/DEMO-SCOPE.md` — hackathon scope and success criteria.

## Submission Integrity

Runtime integrations are considered complete only after they are verified in the hosted application. The public repository intentionally documents the implemented behavior rather than claiming unverified integrations.
