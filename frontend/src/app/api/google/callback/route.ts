import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { exchangeCodeForTokens, storeTokenFromResponse } from '@/lib/google/oauth';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  if (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.redirect(new URL('/settings?error=google_oauth', request.url));
  }

  if (!code || !state) {
    console.error('Google OAuth missing code/state');
    return NextResponse.redirect(new URL('/settings?error=google_oauth', request.url));
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const cookieStore = NextResponse.next().cookies;
  const storedState = cookieStore.get('google_oauth_state')?.value;
  cookieStore.delete('google_oauth_state');

  if (!storedState || storedState !== state) {
    console.error('Google OAuth state mismatch');
    return NextResponse.redirect(new URL('/settings?error=google_state', request.url));
  }

  try {
    const redirectUri = process.env.GOOGLE_REDIRECT_URI ?? `${process.env.NEXT_PUBLIC_SITE_URL}/api/google/callback`;
    const tokenResponse = await exchangeCodeForTokens(code, redirectUri);
    await storeTokenFromResponse(session.user.id, tokenResponse);
    return NextResponse.redirect(new URL('/home/settings?connected=google', request.url));
  } catch (err) {
    console.error('Failed to exchange Google code', err);
    return NextResponse.redirect(new URL('/home/settings?error=google_token', request.url));
  }
}


