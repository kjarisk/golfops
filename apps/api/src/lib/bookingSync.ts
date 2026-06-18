/**
 * Booking sync: mirror Acuity appointments into our `activities` table.
 *
 * Acuity is the source of truth. Synced lessons become `activities` rows with
 * source='acuity', keyed by acuityId, so golfops has one unified booking system.
 * Cancellations in Acuity remove the corresponding synced row.
 */
import { and, eq, inArray } from 'drizzle-orm'
import { db } from '../db/index'
import { activities } from '../db/schema'
import { listAppointments, type AcuityAppointment } from './acuity'

function toActivityRow(a: AcuityAppointment) {
  const clientName = `${a.firstName ?? ''} ${a.lastName ?? ''}`.trim()
  return {
    title: clientName ? `${a.type} — ${clientName}` : a.type,
    activityType: a.type,
    startTime: new Date(a.datetime),
    endTime: a.endTime ? new Date(a.endTime) : null,
    location: a.location || null,
    source: 'acuity' as const,
    acuityId: a.id,
    acuityTypeId: a.appointmentTypeID,
    acuityCalendar: a.calendar || null,
    clientName: clientName || null,
    clientEmail: a.email || null,
    clientPhone: a.phone || null,
    updatedAt: new Date(),
  }
}

/** Default sync window: 90 days back (for charging history) to 180 days ahead. */
function defaultWindow() {
  const now = Date.now()
  const fmt = (ms: number) => new Date(ms).toISOString().slice(0, 10)
  return {
    minDate: fmt(now - 90 * 24 * 60 * 60 * 1000),
    maxDate: fmt(now + 180 * 24 * 60 * 60 * 1000),
  }
}

export interface SyncResult {
  synced: number
  canceled: number
}

export async function syncBookings(window?: { minDate?: string; maxDate?: string }): Promise<SyncResult> {
  const { minDate, maxDate } = { ...defaultWindow(), ...window }
  const appointments = await listAppointments({ minDate, maxDate, max: 1000 })

  const active = appointments.filter(a => !a.canceled)
  const canceledIds = appointments.filter(a => a.canceled).map(a => a.id)

  for (const appt of active) {
    const row = toActivityRow(appt)
    await db
      .insert(activities)
      .values(row)
      .onConflictDoUpdate({ target: activities.acuityId, set: row })
  }

  let canceled = 0
  if (canceledIds.length > 0) {
    const removed = await db
      .delete(activities)
      .where(and(eq(activities.source, 'acuity'), inArray(activities.acuityId, canceledIds)))
      .returning({ id: activities.id })
    canceled = removed.length
  }

  return { synced: active.length, canceled }
}
