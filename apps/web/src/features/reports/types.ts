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
