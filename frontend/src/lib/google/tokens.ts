import { createSupabaseServerClient } from '@/lib/supabase/server';
import { GoogleAuthError } from './errors';
import { refreshAccessToken } from './oauth';

export type StoredGoogleToken = {
  access_token: string;
  refresh_token: string;
  expires_at: string;
  token_type?: string;
  scope?: string;
};

const TABLE_NAME = 'google_tokens';

export async function getStoredGoogleToken(userId: string): Promise<StoredGoogleToken | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('access_token, refresh_token, expires_at, token_type, scope')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching Google token', error);
    throw error;
  }

  if (!data) return null;

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at,
    token_type: data.token_type ?? undefined,
    scope: data.scope ?? undefined,
  };
}

export async function upsertGoogleToken(userId: string, token: StoredGoogleToken) {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from(TABLE_NAME).upsert(
    {
      user_id: userId,
      access_token: token.access_token,
      refresh_token: token.refresh_token,
      expires_at: token.expires_at,
      token_type: token.token_type ?? null,
      scope: token.scope ?? null,
    },
    { onConflict: 'user_id' }
  );

  if (error) {
    console.error('Error storing Google token', error);
    throw error;
  }
}

export function isTokenExpired(expiresAt: string, skewMs: number = 60_000): boolean {
  return new Date(expiresAt).getTime() - skewMs <= Date.now();
}

export async function ensureGoogleAccessToken(userId: string): Promise<string> {
  const stored = await getStoredGoogleToken(userId);
  if (!stored) {
    throw new GoogleAuthError();
  }

  if (!isTokenExpired(stored.expires_at)) {
    return stored.access_token;
  }

  if (!stored.refresh_token) {
    throw new GoogleAuthError('Google refresh token missing');
  }

  const refreshed = await refreshAccessToken(stored.refresh_token);
  const expiresAt = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();

  await upsertGoogleToken(userId, {
    access_token: refreshed.access_token,
    refresh_token: refreshed.refresh_token ?? stored.refresh_token,
    expires_at: expiresAt,
    token_type: refreshed.token_type,
    scope: refreshed.scope ?? stored.scope,
  });

  return refreshed.access_token;
}

