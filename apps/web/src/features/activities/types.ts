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
  createdAt: string
  updatedAt: string
}
