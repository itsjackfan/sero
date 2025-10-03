import { GoogleApiError } from './errors';
import { StoredGoogleToken, upsertGoogleToken } from './tokens';

const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope?: string;
};

function assertEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export async function exchangeCodeForTokens(code: string, redirectUri?: string): Promise<TokenResponse> {
  const clientId = assertEnv('GOOGLE_CLIENT_ID', process.env.GOOGLE_CLIENT_ID);
  const clientSecret = assertEnv('GOOGLE_CLIENT_SECRET', process.env.GOOGLE_CLIENT_SECRET);
  const resolvedRedirectUri = redirectUri ?? assertEnv('GOOGLE_REDIRECT_URI', process.env.GOOGLE_REDIRECT_URI);

  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: resolvedRedirectUri,
    grant_type: 'authorization_code',
  });

  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) {
    throw new GoogleApiError(`Failed to exchange code: ${await response.text()}`);
  }

  return (await response.json()) as TokenResponse;
}

export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  const clientId = assertEnv('GOOGLE_CLIENT_ID', process.env.GOOGLE_CLIENT_ID);
  const clientSecret = assertEnv('GOOGLE_CLIENT_SECRET', process.env.GOOGLE_CLIENT_SECRET);

  const body = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'refresh_token',
  });

  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) {
    throw new GoogleApiError(`Failed to refresh token: ${await response.text()}`);
  }

  return (await response.json()) as TokenResponse;
}

export async function storeTokenFromResponse(userId: string, token: TokenResponse) {
  if (!token.refresh_token) {
    throw new GoogleApiError('Missing refresh token from Google response');
  }

  const expiresAt = new Date(Date.now() + token.expires_in * 1000).toISOString();
  const payload: StoredGoogleToken = {
    access_token: token.access_token,
    refresh_token: token.refresh_token,
    expires_at: expiresAt,
    token_type: token.token_type,
    scope: token.scope,
  };

  await upsertGoogleToken(userId, payload);
}


