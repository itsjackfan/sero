import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ensureGoogleAccessToken } from '@/lib/google/tokens';
import { GoogleAuthError } from '@/lib/google/errors';
import { listGoogleEvents } from '@/lib/google/calendar';

export async function GET(request: Request) {
  const supabase = createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const calendarId = searchParams.get('calendarId');
  const timeMin = searchParams.get('timeMin');
  const timeMax = searchParams.get('timeMax');

  if (!calendarId || !timeMin || !timeMax) {
    return NextResponse.json({ error: 'Missing calendar parameters' }, { status: 400 });
  }

  try {
    const accessToken = await ensureGoogleAccessToken(session.user.id);
    const events = await listGoogleEvents(accessToken, calendarId, timeMin, timeMax);
    return NextResponse.json({ events });
  } catch (error) {
    if (error instanceof GoogleAuthError) {
      return NextResponse.json({ error: 'google_auth_required' }, { status: 401 });
    }

    console.error('Failed to fetch Google events', error);
    return NextResponse.json({ error: 'google_events_failed' }, { status: 500 });
  }
}


