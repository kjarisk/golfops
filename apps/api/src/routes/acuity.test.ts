import { describe, it, expect, vi, beforeEach } from 'vitest'
import Fastify from 'fastify'
import { ZodError } from 'zod'
import { acuityRoutes } from './acuity'

vi.mock('../lib/acuity', () => ({
  isAcuityConfigured: vi.fn(),
  listAppointmentTypes: vi.fn(),
  listCalendars: vi.fn(),
  getAvailabilityDates: vi.fn(),
  getAvailabilityTimes: vi.fn(),
}))

import {
  isAcuityConfigured,
  listAppointmentTypes,
  getAvailabilityDates,
  getAvailabilityTimes,
} from '../lib/acuity'

async function buildApp() {
  const app = Fastify({ logger: false })
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({ error: 'Validation error' })
    }
    return reply.status(500).send({ error: 'Internal server error' })
  })
  await app.register(acuityRoutes)
  return app
}

describe('acuity routes', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 503 for any endpoint when not configured', async () => {
    vi.mocked(isAcuityConfigured).mockReturnValue(false)
    const app = await buildApp()
    const res = await app.inject({ method: 'GET', url: '/api/acuity/appointment-types' })
    expect(res.statusCode).toBe(503)
  })

  it('lists only active appointment types', async () => {
    vi.mocked(isAcuityConfigured).mockReturnValue(true)
    vi.mocked(listAppointmentTypes).mockResolvedValue([
      { id: 1, name: 'Active', duration: 60, price: '600', category: '', active: true },
      { id: 2, name: 'Inactive', duration: 30, price: '300', category: '', active: false },
    ])
    const app = await buildApp()
    const res = await app.inject({ method: 'GET', url: '/api/acuity/appointment-types' })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toHaveLength(1)
    expect(res.json()[0].id).toBe(1)
  })

  it('passes validated params to availability dates', async () => {
    vi.mocked(isAcuityConfigured).mockReturnValue(true)
    vi.mocked(getAvailabilityDates).mockResolvedValue([{ date: '2026-06-20' }])
    const app = await buildApp()
    const res = await app.inject({
      method: 'GET',
      url: '/api/acuity/availability/dates?appointmentTypeID=5&month=2026-06',
    })
    expect(res.statusCode).toBe(200)
    expect(getAvailabilityDates).toHaveBeenCalledWith(5, '2026-06')
  })

  it('returns 400 for a malformed month', async () => {
    vi.mocked(isAcuityConfigured).mockReturnValue(true)
    const app = await buildApp()
    const res = await app.inject({
      method: 'GET',
      url: '/api/acuity/availability/dates?appointmentTypeID=5&month=June',
    })
    expect(res.statusCode).toBe(400)
  })

  it('passes validated params to availability times', async () => {
    vi.mocked(isAcuityConfigured).mockReturnValue(true)
    vi.mocked(getAvailabilityTimes).mockResolvedValue([{ time: '2026-06-20T10:00:00+0200', slotsAvailable: 1 }])
    const app = await buildApp()
    const res = await app.inject({
      method: 'GET',
      url: '/api/acuity/availability/times?appointmentTypeID=5&date=2026-06-20',
    })
    expect(res.statusCode).toBe(200)
    expect(getAvailabilityTimes).toHaveBeenCalledWith(5, '2026-06-20')
  })
})
