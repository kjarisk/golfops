/**
 * Booking sync via Google Calendar.
 *
 * Acuity Scheduling syncs appointments one-way into a dedicated Google Calendar
 * (a feature on all paid Acuity plans — no API/Powerhouse needed). golfops reads
 * that calendar read-only and mirrors each event into the `activities` table as a
 * booking (source='acuity'), keyed by the calendar event id (externalId).
 *
 * Requires: Gmail OAuth connected with calendar.readonly scope, and the env var
 * GOOGLE_BOOKINGS_CALENDAR_ID pointing at the dedicated calendar. Every event on
 * that calendar is treated as a lesson — so it must NOT be your primary calendar.
 */
import { google, type calendar_v3 } from 'googleapis'
import { and, eq, gte, lt, notInArray } from 'drizzle-orm'
import { db } from '../db/index'
import { activities } from '../db/schema'
import { getAuthenticatedClient, isGmailConfigured } from './gmail'

export function isBookingSyncConfigured() {
  return !!process.env.GOOGLE_BOOKINGS_CALENDAR_ID && isGmailConfigured()
}

/**
 * Best-effort parse of an Acuity calendar event title. Acuity formats titles as
 * "{Appointment Type} - {Client Name}". Falls back to the whole summary as the
 * client name and a default type when there's no separator.
 */
export function parseSummary(summary: string): { activityType: string; clientName: string | null } {
  const fallbackType = process.env.GOOGLE_BOOKINGS_DEFAULT_TYPE ?? 'Lesson'
  const trimmed = summary.trim()
  if (!trimmed) return { activityType: fallbackType, clientName: null }
  const sep = trimmed.includes(' - ') ? ' - ' : trimmed.includes(': ') ? ': ' : null
  if (!sep) return { activityType: fallbackType, clientName: trimmed }
  const [type, ...rest] = trimmed.split(sep)
  return { activityType: type.trim() || fallbackType, clientName: rest.join(sep).trim() || null }
}

function toActivityRow(e: calendar_v3.Schema$Event) {
  const { activityType, clientName } = parseSummary(e.summary ?? '')
  return {
    title: e.summary?.trim() || 'Lesson',
    activityType,
    startTime: new Date(e.start!.dateTime!),
    endTime: e.end?.dateTime ? new Date(e.end.dateTime) : null,
    location: e.location || null,
    source: 'acuity' as const,
    externalId: e.id!,
    acuityCalendar: process.env.GOOGLE_BOOKINGS_CALENDAR_ID || null,
    clientName,
    clientEmail: null,
    clientPhone: null,
    updatedAt: new Date(),
  }
}

/** Default sync window: 90 days back (for charging history) to 180 days ahead. */
function defaultWindow() {
  const now = Date.now()
  return {
    timeMin: new Date(now - 90 * 24 * 60 * 60 * 1000),
    timeMax: new Date(now + 180 * 24 * 60 * 60 * 1000),
  }
}

export interface SyncResult {
  synced: number
  canceled: number
}

export async function syncBookings(window?: { timeMin?: Date; timeMax?: Date }): Promise<SyncResult> {
  const { timeMin, timeMax } = { ...defaultWindow(), ...window }
  const calendarId = process.env.GOOGLE_BOOKINGS_CALENDAR_ID!

  const auth = await getAuthenticatedClient()
  const calendar = google.calendar({ version: 'v3', auth })

  const { data } = await calendar.events.list({
    calendarId,
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 2500,
  })

  // Timed, non-cancelled events only (skip all-day blocks and tombstones).
  const active = (data.items ?? []).filter(
    e => e.status !== 'cancelled' && !!e.start?.dateTime && !!e.id
  )

  for (const e of active) {
    const row = toActivityRow(e)
    await db
      .insert(activities)
      .values(row)
      .onConflictDoUpdate({ target: activities.externalId, set: row })
  }

  // Reconcile cancellations: remove synced rows in-window that no longer exist.
  const presentIds = active.map(e => e.id!)
  const inWindow = and(
    eq(activities.source, 'acuity'),
    gte(activities.startTime, timeMin),
    lt(activities.startTime, timeMax)
  )
  const removed = await db
    .delete(activities)
    .where(presentIds.length > 0 ? and(inWindow, notInArray(activities.externalId, presentIds)) : inWindow)
    .returning({ id: activities.id })

  return { synced: active.length, canceled: removed.length }
}
