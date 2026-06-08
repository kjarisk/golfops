import { useQuery } from '@tanstack/react-query'
import type { ActivityReport, TrainerRow } from '../types'

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
