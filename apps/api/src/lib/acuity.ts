/**
 * Acuity Scheduling API client.
 *
 * Single-user business → HTTP Basic Auth with numeric User ID + API Key
 * (OAuth2 is only needed for multi-user apps). Credentials come from env:
 *   ACUITY_USER_ID, ACUITY_API_KEY
 *
 * Acuity is the source of truth for bookings; we mirror appointments into our
 * own `activities` table (see lib/bookingSync.ts).
 */

const BASE_URL = 'https://acuityscheduling.com/api/v1'

export function isAcuityConfigured() {
  return !!(process.env.ACUITY_USER_ID && process.env.ACUITY_API_KEY)
}

function authHeader() {
  const userId = process.env.ACUITY_USER_ID
  const apiKey = process.env.ACUITY_API_KEY
  if (!userId || !apiKey) throw new Error('Acuity not configured')
  return 'Basic ' + Buffer.from(`${userId}:${apiKey}`).toString('base64')
}

async function acuityFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: authHeader(),
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Acuity API ${res.status} on ${path}: ${body}`)
  }

  return res.json() as Promise<T>
}

/** Shape of an Acuity appointment (subset of fields we use). */
export interface AcuityAppointment {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  datetime: string // ISO 8601 with offset
  endTime: string // ISO 8601 with offset
  type: string
  appointmentTypeID: number
  calendar: string
  calendarID: number
  duration: string // minutes, as a string
  location: string
  price: string
  paid: string
  canceled: boolean
}

export interface AcuityAppointmentType {
  id: number
  name: string
  duration: number
  price: string
  category: string
  active: boolean
}

export interface AcuityCalendar {
  id: number
  name: string
  email: string
}

export interface AcuityAvailabilityDate {
  date: string // YYYY-MM-DD
}

export interface AcuityAvailabilityTime {
  time: string // ISO 8601 with offset
  slotsAvailable: number
}

/**
 * List appointments. By default Acuity returns upcoming appointments; pass
 * minDate/maxDate (YYYY-MM-DD) to window the range. Includes canceled ones so
 * the sync can reconcile cancellations.
 */
export function listAppointments(opts: { minDate?: string; maxDate?: string; max?: number } = {}) {
  const params = new URLSearchParams()
  if (opts.minDate) params.set('minDate', opts.minDate)
  if (opts.maxDate) params.set('maxDate', opts.maxDate)
  if (opts.max) params.set('max', String(opts.max))
  params.set('canceled', 'true')
  const qs = params.toString()
  return acuityFetch<AcuityAppointment[]>(`/appointments${qs ? `?${qs}` : ''}`)
}

export function getAppointment(id: number) {
  return acuityFetch<AcuityAppointment>(`/appointments/${id}`)
}

export function listAppointmentTypes() {
  return acuityFetch<AcuityAppointmentType[]>('/appointment-types')
}

export function listCalendars() {
  return acuityFetch<AcuityCalendar[]>('/calendars')
}

export function getAvailabilityDates(appointmentTypeID: number, month: string) {
  const params = new URLSearchParams({ appointmentTypeID: String(appointmentTypeID), month })
  return acuityFetch<AcuityAvailabilityDate[]>(`/availability/dates?${params}`)
}

export function getAvailabilityTimes(appointmentTypeID: number, date: string) {
  const params = new URLSearchParams({ appointmentTypeID: String(appointmentTypeID), date })
  return acuityFetch<AcuityAvailabilityTime[]>(`/availability/times?${params}`)
}

export interface CreateAppointmentInput {
  appointmentTypeID: number
  datetime: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  calendarID?: number
}

export function createAppointment(input: CreateAppointmentInput) {
  return acuityFetch<AcuityAppointment>('/appointments', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}
