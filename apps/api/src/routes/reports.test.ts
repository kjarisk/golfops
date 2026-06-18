import { describe, it, expect, vi, beforeEach } from 'vitest'
import Fastify from 'fastify'
import { ZodError } from 'zod'
import { reportRoutes } from './reports'

const { mockDb } = vi.hoisted(() => ({ mockDb: { execute: vi.fn() } }))
vi.mock('../db/index', () => ({ db: mockDb }))

async function buildApp() {
  const app = Fastify({ logger: false })
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({ error: 'Validation error' })
    }
    return reply.status(500).send({ error: 'Internal server error' })
  })
  await app.register(reportRoutes)
  return app
}

describe('GET /api/reports/hours', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns grouped hours and totals', async () => {
    mockDb.execute
      .mockResolvedValueOnce([{ activity_type: 'Private Lesson', lessons: 3, hours: 3 }])
      .mockResolvedValueOnce([{ lessons: 3, hours: 3 }])
      .mockResolvedValueOnce([{ from_date: '2026-06-01', to_date: '2026-06-20' }])

    const app = await buildApp()
    const res = await app.inject({
      method: 'GET',
      url: '/api/reports/hours?from=2026-06-01&to=2026-06-30',
    })

    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body.byType).toHaveLength(1)
    expect(body.totals).toEqual({ lessons: 3, hours: 3 })
    expect(body.from).toBe('2026-06-01')
  })

  it('returns 400 for a malformed date', async () => {
    const app = await buildApp()
    const res = await app.inject({ method: 'GET', url: '/api/reports/hours?from=June' })
    expect(res.statusCode).toBe(400)
    expect(mockDb.execute).not.toHaveBeenCalled()
  })
})
