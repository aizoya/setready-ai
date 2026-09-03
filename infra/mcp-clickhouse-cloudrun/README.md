# SetReady AI — ClickHouse MCP on Cloud Run

This deployment uses the official ClickHouse MCP server image for the Agentic Cinema ClickHouse track.

## Image

`ghcr.io/clickhouse/mcp-clickhouse:0.4.1`

## Architecture

Gemini Enterprise Agent Platform → authenticated HTTPS MCP endpoint on Cloud Run → ClickHouse Cloud.

The MCP database connection remains read-only. SetReady's Next.js runtime performs deterministic evidence writes separately.

## Cloud Run service

Recommended service name: `setready-clickhouse-mcp`

Recommended region: `us-central1`

Container port: `8080`

Public ingress is required so Agent Platform can reach the HTTPS endpoint. Application-layer bearer-token authentication must remain enabled.

## Required Cloud Run environment variables

Database connection:

- `CLICKHOUSE_HOST=lex38gonim.us-central1.gcp.clickhouse.cloud`
- `CLICKHOUSE_PORT=8443`
- `CLICKHOUSE_SECURE=true`
- `CLICKHOUSE_VERIFY=true`
- `CLICKHOUSE_DATABASE=default`
- `CLICKHOUSE_USER=<read-only MCP user>`
- `CLICKHOUSE_PASSWORD=<read-only MCP user password>`

MCP server:

- `CLICKHOUSE_MCP_SERVER_TRANSPORT=http`
- `CLICKHOUSE_MCP_BIND_HOST=0.0.0.0`
- `CLICKHOUSE_MCP_BIND_PORT=8080`
- `CLICKHOUSE_MCP_AUTH_TOKEN=<generated high-entropy bearer token>`
- `CLICKHOUSE_MCP_ALLOWED_HOSTS=<Cloud Run hostname>`
- `CLICKHOUSE_ALLOW_WRITE_ACCESS=false`

Do not set `CLICKHOUSE_MCP_AUTH_DISABLED=true` in Cloud Run.

## Two-stage host allowlist

The Cloud Run hostname is generated only after the first deployment. Deploy the service, obtain its public hostname, then update `CLICKHOUSE_MCP_ALLOWED_HOSTS` to that exact hostname and redeploy.

`/health` is intentionally unauthenticated and can be used to verify ClickHouse connectivity. The MCP endpoint itself remains bearer-token protected.

## Runtime endpoints

After deployment:

- Health: `https://<cloud-run-host>/health`
- MCP: `https://<cloud-run-host>/mcp`

## Vercel Preview variables after MCP is live

Set these on the SetReady Vercel Preview environment:

- `CLICKHOUSE_HOST=https://lex38gonim.us-central1.gcp.clickhouse.cloud:8443`
- `CLICKHOUSE_DATABASE=default`
- `CLICKHOUSE_USERNAME=default` (temporary app write credential for hackathon evidence; replace later)
- `CLICKHOUSE_PASSWORD=<ClickHouse app password>`
- `CLICKHOUSE_MCP_URL=https://<cloud-run-host>/mcp`
- `CLICKHOUSE_MCP_AUTH_TOKEN=<same MCP bearer token>`

Never commit ClickHouse passwords or MCP bearer tokens.

## Verification order

1. Cloud Run revision is Ready.
2. `GET /health` returns `200 OK` / `OK`.
3. Unauthenticated request to `/mcp` is rejected.
4. Authenticated MCP request succeeds.
5. Vercel `/api/health` shows all required ClickHouse/MCP settings present.
6. SetReady demo run shows Agent Platform + ClickHouse MCP evidence and a successful ClickHouse evidence write.
