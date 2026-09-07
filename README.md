# SetReady AI

SetReady AI is an AI production-intelligence agent for film and television crews, built for Agentic Cinema — The Blockbuster Hackathon.

## What it does

SetReady focuses on one high-value production-operations workflow: a scheduled scene is falling behind, the crew needs a fast operational assessment, and the 1st AD / UPM needs a recommendation that is useful without giving an AI autonomous authority over schedule changes.

Golden path:

**Production disruption → deterministic validation → live ClickHouse evidence → Gemini analysis → bounded operational recommendation → visible runtime proof → human approval boundary**

## Verified runtime

The hackathon demo has been verified end-to-end in the hosted Vercel deployment:

- **ClickHouse: verified-live** — SetReady initializes an authenticated MCP session against the official ClickHouse MCP server running on Google Cloud Run and executes a live read-only query.
- **Gemini: verified-live** — SetReady authenticates from Vercel to Google Cloud using OIDC + Workload Identity Federation, obtains a short-lived service-account access token, and calls Gemini through the Vertex AI API.
- Provider badges only show `verified-live` when the provider succeeds during the current request. Failures are surfaced instead of silently simulated.

## Architecture

```text
User / SetReady UI (Vercel)
        |
        v
Next.js /api/demo
  | deterministic input bounds
  |
  +--> ClickHouse MCP on Google Cloud Run
  |      | bearer-token auth
  |      | MCP initialize + session
  |      `--> live read-only ClickHouse query
  |
  `--> Vercel OIDC
         `--> Google Workload Identity Federation
                `--> SetReady Runtime service account
                       `--> Vertex AI / Gemini

Result: recommendation + provider status + runtime evidence + human approval boundary
```

## Hackathon stack

- Gemini
- Google Cloud / Vertex AI APIs
- Google Cloud Workload Identity Federation
- Google Cloud Run
- Google Cloud Agent Builder / agent-platform capabilities where required by the competition
- ClickHouse Cloud
- Official ClickHouse MCP server
- Vercel
- Next.js + TypeScript

## Safety and authority boundary

The model may reason, summarize, classify, and recommend. Deterministic application logic owns input bounds and workflow controls. Schedule changes remain subject to explicit human production approval; the demo does not autonomously alter a call sheet or production schedule.

## Environment-variable contract

See `.env.example`. No real credentials are committed.

Core runtime variables include:

- `GOOGLE_CLOUD_PROJECT`
- `GOOGLE_CLOUD_LOCATION`
- `GEMINI_MODEL`
- `GCP_PROJECT_ID`
- `GCP_PROJECT_NUMBER`
- `GCP_SERVICE_ACCOUNT_EMAIL`
- `GCP_WORKLOAD_IDENTITY_POOL_ID`
- `GCP_WORKLOAD_IDENTITY_PROVIDER_ID`
- `CLICKHOUSE_MCP_URL`
- `CLICKHOUSE_MCP_AUTH_TOKEN`

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Populate only the environment variables appropriate for your own Google Cloud and ClickHouse resources. Never commit `.env.local` or secret values.

## Demo and submission docs

- `docs/DEMO-SCOPE.md` — scope and acceptance criteria
- `docs/DEMO-SCRIPT.md` — three-minute recording plan
- `docs/DEVPOST-DRAFT.md` — submission-copy working draft

## License

Apache License 2.0. See `LICENSE`.
