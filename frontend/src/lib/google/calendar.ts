import { z } from 'zod';

const CalendarListSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string(),
        summary: z.string().optional(),
        description: z.string().optional(),
        backgroundColor: z.string().optional(),
        accessRole: z.string(),
        primary: z.boolean().optional(),
      })
    )
    .optional(),
});

const EventsListSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string(),
        summary: z.string().optional(),
        description: z.string().optional(),
        start: z
          .object({
            date: z.string().optional(),
            dateTime: z.string().optional(),
            timeZone: z.string().optional(),
          })
          .optional(),
        end: z
          .object({
            date: z.string().optional(),
            dateTime: z.string().optional(),
            timeZone: z.string().optional(),
          })
          .optional(),
        location: z.string().optional(),
        attendees: z
          .array(
            z.object({
              email: z.string().optional(),
              responseStatus: z.string().optional(),
            })
          )
          .optional(),
        hangoutLink: z.string().optional(),
        htmlLink: z.string().optional(),
      })
    )
    .optional(),
});

export type GoogleCalendarItem = {
  id: string;
  summary: string;
  description?: string;
  backgroundColor?: string;
  accessRole: string;
  primary: boolean;
};

export type GoogleCalendarEvent = {
  id: string;
  summary: string;
  description?: string;
  start: string;
  end: string;
  allDay: boolean;
  location?: string;
  attendees: string[];
  hangoutLink?: string;
  htmlLink?: string;
  calendarId: string;
};

export class GoogleAuthError extends Error {
  constructor(message: string = 'Google authentication required') {
    super(message);
    this.name = 'GoogleAuthError';
  }
}

export class GoogleApiError extends Error {
  constructor(message: string = 'Google API error') {
    super(message);
    this.name = 'GoogleApiError';
  }
}

async function googleFetch<T>(url: string, token: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });

  if (response.status === 401 || response.status === 403) {
    throw new GoogleAuthError();
  }

  if (!response.ok) {
    const body = await response.text();
    throw new GoogleApiError(body || `Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function listGoogleCalendars(token: string): Promise<GoogleCalendarItem[]> {
  const data = await googleFetch<any>('https://www.googleapis.com/calendar/v3/users/me/calendarList', token);
  const parsed = CalendarListSchema.safeParse(data);
  if (!parsed.success) {
    throw new GoogleApiError('Failed to parse calendar list');
  }

  return (parsed.data.items ?? []).map((item) => ({
    id: item.id,
    summary: item.summary ?? 'Untitled calendar',
    description: item.description,
    backgroundColor: item.backgroundColor,
    accessRole: item.accessRole,
    primary: item.primary ?? false,
  }));
}

export async function listGoogleEvents(
  token: string,
  calendarId: string,
  timeMin: string,
  timeMax: string
): Promise<GoogleCalendarEvent[]> {
  const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`);
  url.searchParams.set('singleEvents', 'true');
  url.searchParams.set('orderBy', 'startTime');
  url.searchParams.set('showDeleted', 'false');
  url.searchParams.set('timeMin', timeMin);
  url.searchParams.set('timeMax', timeMax);

  const data = await googleFetch<any>(url.toString(), token);
  const parsed = EventsListSchema.safeParse(data);
  if (!parsed.success) {
    throw new GoogleApiError('Failed to parse calendar events');
  }

  return (parsed.data.items ?? [])
    .map((event) => {
      const start = event.start?.dateTime ?? event.start?.date;
      const end = event.end?.dateTime ?? event.end?.date;
      if (!start || !end) return null;

      const allDay = Boolean(event.start?.date && event.end?.date);

      return {
        id: event.id,
        summary: event.summary ?? 'Untitled event',
        description: event.description,
        start,
        end,
        allDay,
        location: event.location,
        attendees: (event.attendees ?? []).map((att) => att.email).filter(Boolean) as string[],
        hangoutLink: event.hangoutLink,
        htmlLink: event.htmlLink,
        calendarId,
      } satisfies GoogleCalendarEvent;
    })
    .filter(Boolean) as GoogleCalendarEvent[];
}

