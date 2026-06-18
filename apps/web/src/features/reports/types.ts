export interface ActivityTypeRow {
  activity_type: string
  total: number
  total_participants: number
}

export interface MonthTypeRow {
  activity_type: string
  count: number
  participants: number
}

export interface ActivityTotals {
  activities: number
  participants: number
}

export interface ActivityReport {
  byType: ActivityTypeRow[]
  thisMonth: MonthTypeRow[]
  totals: ActivityTotals
}

export interface TrainerRow {
  id: number
  name: string
  activity_count: number
  total_minutes: number
}

export interface HoursTypeRow {
  activity_type: string
  lessons: number
  hours: number
}

export interface HoursReport {
  from: string | null
  to: string | null
  byType: HoursTypeRow[]
  totals: { lessons: number; hours: number }
  range: { from_date: string | null; to_date: string | null }
}
