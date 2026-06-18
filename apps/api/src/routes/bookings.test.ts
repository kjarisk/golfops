import { describe, it, expect, vi, beforeEach } from 'vitest'
import Fastify from 'fastify'
import { bookingRoutes } from './bookings'

vi.mock('../lib/calendarBookings', () => ({
  isBookingSyncConfigured: vi.fn(),
  syncBookings: vi.fn(),
}))

import { isBookingSyncConfigured, syncBookings } from '../lib/calendarBookings'

async function buildApp() {
  const app = Fastify({ logger: false })
  await app.register(bookingRoutes)
  return app
}

describe('POST /api/bookings/sync', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 503 when booking sync is not configured', async () => {
    vi.mocked(isBookingSyncConfigured).mockReturnValue(false)
    const app = await buildApp()
    const res = await app.inject({ method: 'POST', url: '/api/bookings/sync' })
    expect(res.statusCode).toBe(503)
    expect(syncBookings).not.toHaveBeenCalled()
  })

  it('runs the sync and returns the result when configured', async () => {
    vi.mocked(isBookingSyncConfigured).mockReturnValue(true)
    vi.mocked(syncBookings).mockResolvedValue({ synced: 3, canceled: 1 })
    const app = await buildApp()
    const res = await app.inject({ method: 'POST', url: '/api/bookings/sync' })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual({ synced: 3, canceled: 1 })
  })

  it('returns 401 when the Google account is not connected', async () => {
    vi.mocked(isBookingSyncConfigured).mockReturnValue(true)
    vi.mocked(syncBookings).mockRejectedValue(new Error('Gmail not connected'))
    const app = await buildApp()
    const res = await app.inject({ method: 'POST', url: '/api/bookings/sync' })
    expect(res.statusCode).toBe(401)
  })
})

describe('GET /api/bookings/status', () => {
  beforeEach(() => vi.clearAllMocks())

  it('reports configured state', async () => {
    vi.mocked(isBookingSyncConfigured).mockReturnValue(true)
    const app = await buildApp()
    const res = await app.inject({ method: 'GET', url: '/api/bookings/status' })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual({ configured: true })
  })
})
