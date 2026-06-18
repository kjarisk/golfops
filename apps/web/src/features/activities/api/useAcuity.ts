import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface AppointmentType {
  id: number
  name: string
  duration: number
  price: string
  category: string
  active: boolean
}

export interface AvailabilityDate {
  date: string // YYYY-MM-DD
}

export interface AvailabilityTime {
  time: string // ISO 8601 with offset
  slotsAvailable: number
}

export interface CreateBookingInput {
  appointmentTypeID: number
  datetime: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  calendarID?: number
}

async function getJson<T>(url: string, errorMsg: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(errorMsg)
  return res.json() as Promise<T>
}

export function useAppointmentTypes(enabled = true) {
  return useQuery({
    queryKey: ['acuity-appointment-types'],
    queryFn: () =>
      getJson<AppointmentType[]>(
        '/api/acuity/appointment-types',
        'Failed to load appointment types'
      ),
    enabled,
  })
}

export function useAvailabilityDates(
  appointmentTypeID: number | null,
  month: string
) {
  return useQuery({
    queryKey: ['acuity-dates', appointmentTypeID, month],
    queryFn: () =>
      getJson<AvailabilityDate[]>(
        `/api/acuity/availability/dates?appointmentTypeID=${appointmentTypeID}&month=${month}`,
        'Failed to load available dates'
      ),
    enabled: !!appointmentTypeID && !!month,
  })
}

export function useAvailabilityTimes(
  appointmentTypeID: number | null,
  date: string | null
) {
  return useQuery({
    queryKey: ['acuity-times', appointmentTypeID, date],
    queryFn: () =>
      getJson<AvailabilityTime[]>(
        `/api/acuity/availability/times?appointmentTypeID=${appointmentTypeID}&date=${date}`,
        'Failed to load available times'
      ),
    enabled: !!appointmentTypeID && !!date,
  })
}

export function useCreateBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateBookingInput) => {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string
        } | null
        throw new Error(body?.error ?? 'Failed to create booking')
      }
      return res.json()
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['activities'] }),
  })
}
