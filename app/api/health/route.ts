import { NextResponse } from "next/server";
import { getVercelOidcToken } from "@vercel/oidc";

export const runtime = "nodejs";

function present(name: string) {
  return Boolean(process.env[name]);
}

export async function GET() {
  let oidcAvailable = false;
  try {
    const token = await getVercelOidcToken();
    oidcAvailable = Boolean(token);
  } catch {
    oidcAvailable = false;
  }

  const checks = {
    gcpProjectId: present("GCP_PROJECT_ID"),
    gcpProjectNumber: present("GCP_PROJECT_NUMBER"),
    workloadIdentityPoolId: present("GCP_WORKLOAD_IDENTITY_POOL_ID"),
    workloadIdentityProviderId: present("GCP_WORKLOAD_IDENTITY_PROVIDER_ID"),
    serviceAccountEmail: present("GCP_SERVICE_ACCOUNT_EMAIL"),
    vercelOidcToken: oidcAvailable,
    googleAgentId: present("GOOGLE_AGENT_ID"),
    clickhouseHost: present("CLICKHOUSE_HOST"),
    clickhouseDatabase: present("CLICKHOUSE_DATABASE"),
    clickhouseUsername: present("CLICKHOUSE_USERNAME"),
    clickhousePassword: present("CLICKHOUSE_PASSWORD"),
    clickhouseMcpUrl: present("CLICKHOUSE_MCP_URL"),
    clickhouseMcpAuthToken: present("CLICKHOUSE_MCP_AUTH_TOKEN"),
  };

  const required = [
    checks.gcpProjectId,
    checks.gcpProjectNumber,
    checks.workloadIdentityPoolId,
    checks.workloadIdentityProviderId,
    checks.serviceAccountEmail,
    checks.vercelOidcToken,
    checks.clickhouseHost,
    checks.clickhouseDatabase,
    checks.clickhouseUsername,
    checks.clickhousePassword,
    checks.clickhouseMcpUrl,
  ];

  return NextResponse.json({
    ok: required.every(Boolean),
    checks,
    note: "This endpoint reports presence only and never returns secret values.",
  });
}
