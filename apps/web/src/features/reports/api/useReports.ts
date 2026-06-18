import { useQuery } from '@tanstack/react-query'
import type { ActivityReport, TrainerRow, HoursReport } from '../types'

async function fetchActivityReport(): Promise<ActivityReport> {
  const res = await fetch('/api/reports/activities')
  if (!res.ok) throw new Error('Failed to fetch activity report')
  return res.json() as Promise<ActivityReport>
}

async function fetchTrainerReport(): Promise<TrainerRow[]> {
  const res = await fetch('/api/reports/trainers')
  if (!res.ok) throw new Error('Failed to fetch trainer report')
  return res.json() as Promise<TrainerRow[]>
}

export function useActivityReport() {
  return useQuery({
    queryKey: ['reports', 'activities'],
    queryFn: fetchActivityReport,
  })
}

export function useTrainerReport() {
  return useQuery({
    queryKey: ['reports', 'trainers'],
    queryFn: fetchTrainerReport,
  })
}

async function fetchHoursReport(
  from: string,
  to: string
): Promise<HoursReport> {
  const params = new URLSearchParams()
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  const qs = params.toString()
  const res = await fetch(`/api/reports/hours${qs ? `?${qs}` : ''}`)
  if (!res.ok) throw new Error('Failed to fetch hours report')
  return res.json() as Promise<HoursReport>
}

export function useHoursReport(from: string, to: string) {
  return useQuery({
    queryKey: ['reports', 'hours', from, to],
    queryFn: () => fetchHoursReport(from, to),
  })
}
