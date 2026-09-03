import { getVercelOidcToken } from '@vercel/oidc';
import { ExternalAccountClient } from 'google-auth-library';

const requiredEnv = [
  'GCP_PROJECT_ID',
  'GCP_PROJECT_NUMBER',
  'GCP_WORKLOAD_IDENTITY_POOL_ID',
  'GCP_WORKLOAD_IDENTITY_PROVIDER_ID',
  'GCP_SERVICE_ACCOUNT_EMAIL',
] as const;

type RequiredEnvName = (typeof requiredEnv)[number];

function getRequiredEnv(name: RequiredEnvName): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getGoogleCloudRuntimeConfig() {
  const projectId = getRequiredEnv('GCP_PROJECT_ID');
  const projectNumber = getRequiredEnv('GCP_PROJECT_NUMBER');
  const workloadIdentityPoolId = getRequiredEnv('GCP_WORKLOAD_IDENTITY_POOL_ID');
  const workloadIdentityProviderId = getRequiredEnv(
    'GCP_WORKLOAD_IDENTITY_PROVIDER_ID',
  );
  const serviceAccountEmail = getRequiredEnv('GCP_SERVICE_ACCOUNT_EMAIL');

  const providerAudience = `//iam.googleapis.com/projects/${projectNumber}/locations/global/workloadIdentityPools/${workloadIdentityPoolId}/providers/${workloadIdentityProviderId}`;

  return {
    projectId,
    projectNumber,
    workloadIdentityPoolId,
    workloadIdentityProviderId,
    serviceAccountEmail,
    providerAudience,
  };
}

export function createGoogleCloudAuthClient() {
  const config = getGoogleCloudRuntimeConfig();

  const authClient = ExternalAccountClient.fromJSON({
    type: 'external_account',
    audience: config.providerAudience,
    subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
    token_url: 'https://sts.googleapis.com/v1/token',
    service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${config.serviceAccountEmail}:generateAccessToken`,
    subject_token_supplier: {
      getSubjectToken: getVercelOidcToken,
    },
  });

  if (!authClient) {
    throw new Error('Unable to initialize Google external account client');
  }

  return authClient;
}
