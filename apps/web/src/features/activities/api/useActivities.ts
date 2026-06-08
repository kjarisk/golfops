import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Activity } from '../types'

async function fetchActivities(): Promise<Activity[]> {
  const res = await fetch('/api/activities')
  if (!res.ok) throw new Error('Failed to fetch activities')
  return res.json() as Promise<Activity[]>
}

async function patchActivity(
  id: number,
  data: Partial<Activity>
): Promise<Activity> {
  const res = await fetch(`/api/activities/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update activity')
  return res.json() as Promise<Activity>
}

export function useActivities() {
  return useQuery({ queryKey: ['activities'], queryFn: fetchActivities })
}

export function usePatchActivity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Activity> }) =>
      patchActivity(id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['activities'] }),
  })
}
