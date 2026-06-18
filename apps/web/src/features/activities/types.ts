export interface Trainer {
  id: number
  name: string
}

export type BookingSource = 'manual' | 'acuity'

export interface Activity {
  id: number
  title: string
  activityType: string
  startTime: string
  endTime: string | null
  location: string | null
  capacity: number | null
  participantCount: number
  requiresGolfboxReservation: boolean
  golfboxReservationCompleted: boolean
  golfboxReservationNote: string | null
  trainers: Trainer[]
  // Booking source: 'manual' (created in golfops) or 'acuity' (synced via Google Calendar).
  source: BookingSource
  externalId: string | null
  acuityTypeId: number | null
  acuityCalendar: string | null
  clientName: string | null
  clientEmail: string | null
  clientPhone: string | null
  createdAt: string
  updatedAt: string
}
