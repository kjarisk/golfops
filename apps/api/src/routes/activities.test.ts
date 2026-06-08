import { describe, it, expect, vi, beforeEach } from 'vitest'
import Fastify from 'fastify'
import { ZodError } from 'zod'
import { activityRoutes } from './activities'

// Hoisted so the vi.mock factory below can reference it
const { mockDb } = vi.hoisted(() => {
  const mockDb = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
  }
  return { mockDb }
})

vi.mock('../db/index', () => ({ db: mockDb }))

const mockActivity = {
  id: 1,
  title: 'VTG Onsdagskveld',
  activityType: 'VTG',
  startTime: new Date('2026-06-15T17:00:00.000Z'),
  endTime: null,
  location: 'Ekebergbanen',
  capacity: 12,
  participantCount: 0,
  requiresGolfboxReservation: false,
  golfboxReservationCompleted: false,
  golfboxReservationNote: null,
  createdAt: new Date('2026-06-08T10:00:00.000Z'),
  updatedAt: new Date('2026-06-08T10:00:00.000Z'),
}

async function buildApp() {
  const app = Fastify({ logger: false })
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({ error: 'Validation error', issues: error.issues })
    }
    return reply.status(500).send({ error: 'Internal server error' })
  })
  await app.register(activityRoutes)
  return app
}

describe('GET /api/activities', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 200 with empty array', async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        orderBy: vi.fn().mockResolvedValue([]),
      }),
    })
    const app = await buildApp()
    const res = await app.inject({ method: 'GET', url: '/api/activities' })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual([])
  })

  it('returns 200 with activities list including trainers', async () => {
    // First select: activities
    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        orderBy: vi.fn().mockResolvedValue([mockActivity]),
      }),
    })
    // Second select: activity_trainers join
    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        innerJoin: vi.fn().mockResolvedValue([]),
      }),
    })
    const app = await buildApp()
    const res = await app.inject({ method: 'GET', url: '/api/activities' })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toHaveLength(1)
    expect(res.json()[0].id).toBe(1)
    expect(res.json()[0].trainers).toEqual([])
  })
})

describe('POST /api/activities', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 201 with created activity', async () => {
    mockDb.insert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([mockActivity]),
      }),
    })
    const app = await buildApp()
    const res = await app.inject({
      method: 'POST',
      url: '/api/activities',
      payload: {
        title: 'VTG Onsdagskveld',
        activityType: 'VTG',
        startTime: '2026-06-15T17:00:00.000Z',
      },
    })
    expect(res.statusCode).toBe(201)
    expect(res.json().id).toBe(1)
  })

  it('returns 400 when title is missing', async () => {
    const app = await buildApp()
    const res = await app.inject({
      method: 'POST',
      url: '/api/activities',
      payload: { activityType: 'VTG', startTime: '2026-06-15T17:00:00.000Z' },
    })
    expect(res.statusCode).toBe(400)
  })

  it('returns 400 when activityType is missing', async () => {
    const app = await buildApp()
    const res = await app.inject({
      method: 'POST',
      url: '/api/activities',
      payload: { title: 'VTG Onsdagskveld', startTime: '2026-06-15T17:00:00.000Z' },
    })
    expect(res.statusCode).toBe(400)
  })

  it('returns 400 when startTime is not a valid ISO datetime', async () => {
    const app = await buildApp()
    const res = await app.inject({
      method: 'POST',
      url: '/api/activities',
      payload: { title: 'VTG Onsdagskveld', activityType: 'VTG', startTime: 'not-a-date' },
    })
    expect(res.statusCode).toBe(400)
  })
})

describe('PATCH /api/activities/:id', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 200 with updated activity', async () => {
    mockDb.update.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ ...mockActivity, title: 'Updated' }]),
        }),
      }),
    })
    const app = await buildApp()
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/activities/1',
      payload: { title: 'Updated' },
    })
    expect(res.statusCode).toBe(200)
    expect(res.json().title).toBe('Updated')
  })

  it('returns 404 when activity not found', async () => {
    mockDb.update.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      }),
    })
    const app = await buildApp()
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/activities/999',
      payload: { title: 'Ghost' },
    })
    expect(res.statusCode).toBe(404)
  })

  it('returns 400 when body is empty', async () => {
    const app = await buildApp()
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/activities/1',
      payload: {},
    })
    expect(res.statusCode).toBe(400)
  })
})
