import { describe, it, expect, vi, beforeEach } from 'vitest'
import Fastify from 'fastify'
import { bookingRoutes } from './bookings'

vi.mock('../lib/acuity', () => ({
  isAcuityConfigured: vi.fn(),
  createAppointment: vi.fn(),
}))
vi.mock('../lib/bookingSync', () => ({ syncBookings: vi.fn() }))

import { ZodError } from 'zod'
import { isAcuityConfigured, createAppointment } from '../lib/acuity'
import { syncBookings } from '../lib/bookingSync'

async function buildApp() {
  const app = Fastify({ logger: false })
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({ error: 'Validation error' })
    }
    return reply.status(500).send({ error: 'Internal server error' })
  })
  await app.register(bookingRoutes)
  return app
}

const validBooking = {
  appointmentTypeID: 5,
  datetime: '2026-06-20T10:00:00+0200',
  firstName: 'Ola',
  lastName: 'Nordmann',
}

describe('POST /api/bookings/sync', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 503 when Acuity is not configured', async () => {
    vi.mocked(isAcuityConfigured).mockReturnValue(false)
    const app = await buildApp()
    const res = await app.inject({ method: 'POST', url: '/api/bookings/sync' })
    expect(res.statusCode).toBe(503)
    expect(syncBookings).not.toHaveBeenCalled()
  })

  it('runs the sync and returns the result when configured', async () => {
    vi.mocked(isAcuityConfigured).mockReturnValue(true)
    vi.mocked(syncBookings).mockResolvedValue({ synced: 3, canceled: 1 })
    const app = await buildApp()
    const res = await app.inject({ method: 'POST', url: '/api/bookings/sync' })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual({ synced: 3, canceled: 1 })
  })
})

describe('POST /api/bookings', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 503 when Acuity is not configured', async () => {
    vi.mocked(isAcuityConfigured).mockReturnValue(false)
    const app = await buildApp()
    const res = await app.inject({ method: 'POST', url: '/api/bookings', payload: validBooking })
    expect(res.statusCode).toBe(503)
    expect(createAppointment).not.toHaveBeenCalled()
  })

  it('creates the appointment in Acuity and re-syncs', async () => {
    vi.mocked(isAcuityConfigured).mockReturnValue(true)
    vi.mocked(createAppointment).mockResolvedValue({ id: 999 } as never)
    vi.mocked(syncBookings).mockResolvedValue({ synced: 1, canceled: 0 })
    const app = await buildApp()
    const res = await app.inject({ method: 'POST', url: '/api/bookings', payload: validBooking })
    expect(res.statusCode).toBe(201)
    expect(res.json()).toEqual({ id: 999 })
    expect(createAppointment).toHaveBeenCalledWith(expect.objectContaining({ appointmentTypeID: 5 }))
    expect(syncBookings).toHaveBeenCalled()
  })

  it('returns 400 when required fields are missing', async () => {
    vi.mocked(isAcuityConfigured).mockReturnValue(true)
    const app = await buildApp()
    const res = await app.inject({
      method: 'POST',
      url: '/api/bookings',
      payload: { appointmentTypeID: 5 },
    })
    expect(res.statusCode).toBe(400)
    expect(createAppointment).not.toHaveBeenCalled()
  })
})

describe('GET /api/bookings/status', () => {
  beforeEach(() => vi.clearAllMocks())

  it('reports configured state', async () => {
    vi.mocked(isAcuityConfigured).mockReturnValue(true)
    const app = await buildApp()
    const res = await app.inject({ method: 'GET', url: '/api/bookings/status' })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual({ configured: true })
  })
})
