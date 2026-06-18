import { z } from 'zod'

export const HealthResponseSchema = z.object({
  status: z.literal('ok'),
  service: z.string(),
})

export type HealthResponse = z.infer<typeof HealthResponseSchema>

// --- Bookings (M8) ---
// Stable contracts for booking data, shared by the API and future consumers
// (e.g. jgk.kjarisk.com syncing bookings from golfops).

export const BookingSourceSchema = z.enum(['manual', 'acuity'])
export type BookingSource = z.infer<typeof BookingSourceSchema>

/** A unified booking/activity row as returned by GET /api/activities. */
export const BookingSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  activityType: z.string(),
  startTime: z.string(),
  endTime: z.string().nullable(),
  location: z.string().nullable(),
  source: BookingSourceSchema,
  acuityId: z.number().int().nullable(),
  acuityTypeId: z.number().int().nullable(),
  acuityCalendar: z.string().nullable(),
  clientName: z.string().nullable(),
  clientEmail: z.string().nullable(),
  clientPhone: z.string().nullable(),
})
export type Booking = z.infer<typeof BookingSchema>

export const SyncResultSchema = z.object({
  synced: z.number().int(),
  canceled: z.number().int(),
})
export type SyncResult = z.infer<typeof SyncResultSchema>

/** Charging report (lesson hours to invoice the club). */
export const HoursReportSchema = z.object({
  from: z.string().nullable(),
  to: z.string().nullable(),
  byType: z.array(
    z.object({
      activity_type: z.string(),
      lessons: z.number().int(),
      hours: z.number(),
    })
  ),
  totals: z.object({ lessons: z.number().int(), hours: z.number() }),
  range: z.object({
    from_date: z.string().nullable(),
    to_date: z.string().nullable(),
  }),
})
export type HoursReport = z.infer<typeof HoursReportSchema>
