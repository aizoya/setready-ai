import { createGoogleCloudAuthClient, getGoogleCloudRuntimeConfig } from '@/lib/google-cloud-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const startedAt = Date.now();

  try {
    const config = getGoogleCloudRuntimeConfig();
    const authClient = createGoogleCloudAuthClient();
    const accessToken = await authClient.getAccessToken();

    if (!accessToken?.token) {
      throw new Error('Google Cloud did not return an access token');
    }

    return Response.json({
      ok: true,
      auth: 'vercel-oidc-workload-identity-federation',
      projectId: config.projectId,
      serviceAccount: config.serviceAccountEmail,
      provider: config.workloadIdentityProviderId,
      latencyMs: Date.now() - startedAt,
    });
  } catch (error) {
    console.error('SetReady Google Cloud auth health check failed', error);

    return Response.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unknown Google Cloud authentication error',
      },
      { status: 500 },
    );
  }
}
