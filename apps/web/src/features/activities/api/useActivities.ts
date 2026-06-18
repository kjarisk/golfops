import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Activity } from '../types'

export type CreateActivityInput = {
  title: string
  activityType: string
  startTime: string
  endTime?: string
  location?: string
  capacity?: number
  requiresGolfboxReservation?: boolean
  golfboxReservationNote?: string
}

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

async function createActivity(input: CreateActivityInput): Promise<Activity> {
  const res = await fetch('/api/activities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to create activity')
  return res.json() as Promise<Activity>
}

export function useCreateActivity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createActivity,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['activities'] }),
  })
}

export type BookingStatus = { configured: boolean }
export type SyncResult = { synced: number; canceled: number }

async function fetchBookingStatus(): Promise<BookingStatus> {
  const res = await fetch('/api/bookings/status')
  if (!res.ok) throw new Error('Failed to fetch booking status')
  return res.json() as Promise<BookingStatus>
}

export function useBookingStatus() {
  return useQuery({ queryKey: ['booking-status'], queryFn: fetchBookingStatus })
}

async function syncBookings(): Promise<SyncResult> {
  const res = await fetch('/api/bookings/sync', { method: 'POST' })
  if (!res.ok) throw new Error('Failed to sync bookings')
  return res.json() as Promise<SyncResult>
}

export function useSyncBookings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: syncBookings,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['activities'] }),
  })
}
