import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const CalendarSettingsSchema = z.object({
  enabled_calendars: z.array(z.string()),
  sync_frequency: z.enum(['realtime', 'hourly', 'daily']).default('realtime'),
});

const TABLE_NAME = 'calendar_settings';

export async function GET() {
  const supabase = createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('enabled_calendars, sync_frequency')
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (error) {
    console.error('Failed to load calendar settings', error);
    return NextResponse.json({ error: 'calendar_settings_failed' }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    settings: {
      enabled_calendars: data?.enabled_calendars ?? [],
      sync_frequency: data?.sync_frequency ?? 'realtime',
    },
  });
}

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = CalendarSettingsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const { enabled_calendars, sync_frequency } = parsed.data;

  const { error } = await supabase.from(TABLE_NAME).upsert(
    {
      user_id: session.user.id,
      enabled_calendars,
      sync_frequency,
    },
    { onConflict: 'user_id' }
  );

  if (error) {
    console.error('Failed to save calendar settings', error);
    return NextResponse.json({ error: 'calendar_settings_save_failed' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}


