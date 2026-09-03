# Cloud Run field map — SetReady ClickHouse MCP

Use this file while creating the Cloud Run service. Do not commit secret values.

## Service

- Deployment source: Existing container image
- Container image: `ghcr.io/clickhouse/mcp-clickhouse:0.4.1`
- Service name: `setready-clickhouse-mcp`
- Region: `us-central1`
- Ingress / authentication: Public HTTPS endpoint required for Agent Platform reachability; MCP application authentication remains enabled separately
- Billing: Request-based
- Autoscaling: min 0, max 1
- Container port: `8080`

## Non-secret environment variables

- `CLICKHOUSE_HOST=lex38gonim.us-central1.gcp.clickhouse.cloud`
- `CLICKHOUSE_PORT=8443`
- `CLICKHOUSE_SECURE=true`
- `CLICKHOUSE_DATABASE=default`
- `CLICKHOUSE_USER=setready_mcp`
- `CLICKHOUSE_READONLY=true`
- `CLICKHOUSE_MCP_SERVER_TRANSPORT=http`
- `CLICKHOUSE_MCP_BIND_HOST=0.0.0.0`
- `CLICKHOUSE_MCP_BIND_PORT=8080`

After Cloud Run creates the service hostname, add that hostname to the MCP server's allowed-host configuration according to the pinned mcp-clickhouse version's HTTP host validation setting, then deploy a new revision.

## Secrets — use Secret Manager / secret references

- `CLICKHOUSE_PASSWORD` — password for `setready_mcp`
- `CLICKHOUSE_MCP_AUTH_TOKEN` — separate random bearer token for the MCP endpoint

Never place either value in GitHub, screenshots, or chat.

## Verification sequence

1. Cloud Run revision becomes Ready.
2. `/health` succeeds and confirms ClickHouse connectivity.
3. MCP endpoint is reachable at `/mcp` and rejects missing/invalid MCP auth.
4. Add the Cloud Run MCP URL and token to Vercel Preview as `CLICKHOUSE_MCP_URL` and `CLICKHOUSE_MCP_AUTH_TOKEN`.
5. Add the application ClickHouse write connection to Vercel Preview.
6. Redeploy SetReady preview.
7. `/api/health` reports all required configuration present.
8. Run SetReady golden-path analysis.
9. Verify UI evidence: Agent Platform true, ClickHouse MCP true, ClickHouse write true.
10. Only then move PR #2 out of Draft and merge.
