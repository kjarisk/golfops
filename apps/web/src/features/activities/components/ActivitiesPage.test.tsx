/// <reference types="vitest/globals" />
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ActivitiesPage } from './ActivitiesPage'
import type { Activity } from '../types'

function makeActivity(over: Partial<Activity>): Activity {
  return {
    id: 1,
    title: 'VTG Onsdag',
    activityType: 'VTG',
    startTime: '2026-06-20T17:00:00.000Z',
    endTime: null,
    location: 'Ekeberg',
    capacity: 12,
    participantCount: 0,
    requiresGolfboxReservation: false,
    golfboxReservationCompleted: false,
    golfboxReservationNote: null,
    trainers: [],
    source: 'manual',
    acuityId: null,
    acuityTypeId: null,
    acuityCalendar: null,
    clientName: null,
    clientEmail: null,
    clientPhone: null,
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
    ...over,
  }
}

const activities: Activity[] = [
  makeActivity({ id: 1, title: 'VTG Onsdag', source: 'manual' }),
  makeActivity({
    id: 2,
    title: 'Private Lesson — Ola Nordmann',
    activityType: 'Private Lesson',
    source: 'acuity',
    acuityId: 555,
    clientName: 'Ola Nordmann',
  }),
]

function mockFetch(configured = true) {
  return vi.fn(async (url: string) => {
    if (url === '/api/activities')
      return { ok: true, json: async () => activities } as Response
    if (url === '/api/bookings/status')
      return { ok: true, json: async () => ({ configured }) } as Response
    throw new Error(`unexpected fetch: ${url}`)
  })
}

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <ActivitiesPage />
    </QueryClientProvider>
  )
}

describe('ActivitiesPage', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('renders manual and acuity rows with source badges', async () => {
    vi.stubGlobal('fetch', mockFetch())
    renderPage()

    expect(await screen.findByText('VTG Onsdag')).toBeTruthy()
    expect(screen.getByText('Private Lesson — Ola Nordmann')).toBeTruthy()
    const table = within(screen.getByRole('table'))
    expect(table.getByText('Acuity')).toBeTruthy()
    expect(table.getByText('Manual')).toBeTruthy()
  })

  it('filters by source', async () => {
    vi.stubGlobal('fetch', mockFetch())
    renderPage()
    await screen.findByText('VTG Onsdag')

    fireEvent.change(screen.getByLabelText('Source'), {
      target: { value: 'acuity' },
    })

    expect(screen.queryByText('VTG Onsdag')).toBeNull()
    expect(screen.getByText('Private Lesson — Ola Nordmann')).toBeTruthy()
  })

  it('shows the Sync now button only when Acuity is configured', async () => {
    vi.stubGlobal('fetch', mockFetch(false))
    renderPage()
    await screen.findByText('VTG Onsdag')
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Sync now' })).toBeNull()
    )
  })
})
