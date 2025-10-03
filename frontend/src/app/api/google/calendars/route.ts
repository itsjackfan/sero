import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ensureGoogleAccessToken } from '@/lib/google/tokens';
import { GoogleAuthError } from '@/lib/google/errors';
import { listGoogleCalendars } from '@/lib/google/calendar';

export async function GET() {
  const supabase = createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const accessToken = await ensureGoogleAccessToken(session.user.id);
    const calendars = await listGoogleCalendars(accessToken);
    return NextResponse.json({ calendars });
  } catch (error) {
    if (error instanceof GoogleAuthError) {
      return NextResponse.json({ error: 'google_auth_required' }, { status: 401 });
    }

    console.error('Failed to fetch Google calendars', error);
    return NextResponse.json({ error: 'google_calendars_failed' }, { status: 500 });
  }
}


