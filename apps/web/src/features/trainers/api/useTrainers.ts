import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface TrainerRecord {
  id: number
  name: string
  email: string | null
  active: boolean
  createdAt: string
}

async function fetchTrainers(): Promise<TrainerRecord[]> {
  const res = await fetch('/api/trainers')
  if (!res.ok) throw new Error('Failed to fetch trainers')
  return res.json() as Promise<TrainerRecord[]>
}

async function assignTrainer(
  activityId: number,
  trainerId: number
): Promise<void> {
  const res = await fetch(`/api/activities/${activityId}/trainers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trainerId }),
  })
  if (!res.ok) throw new Error('Failed to assign trainer')
}

async function unassignTrainer(
  activityId: number,
  trainerId: number
): Promise<void> {
  const res = await fetch(
    `/api/activities/${activityId}/trainers/${trainerId}`,
    {
      method: 'DELETE',
    }
  )
  if (!res.ok) throw new Error('Failed to unassign trainer')
}

export function useTrainers() {
  return useQuery({ queryKey: ['trainers'], queryFn: fetchTrainers })
}

export function useAssignTrainer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      activityId,
      trainerId,
    }: {
      activityId: number
      trainerId: number
    }) => assignTrainer(activityId, trainerId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['activities'] }),
  })
}

export function useUnassignTrainer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      activityId,
      trainerId,
    }: {
      activityId: number
      trainerId: number
    }) => unassignTrainer(activityId, trainerId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['activities'] }),
  })
}
