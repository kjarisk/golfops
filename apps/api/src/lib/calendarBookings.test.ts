import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockDb, mockEventsList } = vi.hoisted(() => ({
  mockDb: { insert: vi.fn(), delete: vi.fn() },
  mockEventsList: vi.fn(),
}))

vi.mock('../db/index', () => ({ db: mockDb }))
vi.mock('./gmail', () => ({
  getAuthenticatedClient: vi.fn().mockResolvedValue({}),
  isGmailConfigured: vi.fn().mockReturnValue(true),
}))
vi.mock('googleapis', () => ({
  google: { calendar: () => ({ events: { list: mockEventsList } }) },
}))

import { parseSummary, syncBookings } from './calendarBookings'

describe('parseSummary', () => {
  it('splits "Type - Client"', () => {
    expect(parseSummary('Private Lesson - Ola Nordmann')).toEqual({
      activityType: 'Private Lesson',
      clientName: 'Ola Nordmann',
    })
  })

  it('treats a separator-less title as the client name with a default type', () => {
    expect(parseSummary('Ola Nordmann')).toEqual({
      activityType: 'Lesson',
      clientName: 'Ola Nordmann',
    })
  })

  it('handles an empty title', () => {
    expect(parseSummary('')).toEqual({ activityType: 'Lesson', clientName: null })
  })
})

describe('syncBookings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.GOOGLE_BOOKINGS_CALENDAR_ID = 'golf-cal'
    mockDb.insert.mockReturnValue({
      values: vi.fn().mockReturnValue({ onConflictDoUpdate: vi.fn().mockResolvedValue(undefined) }),
    })
    mockDb.delete.mockReturnValue({
      where: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([]) }),
    })
  })

  it('upserts timed events and skips all-day and cancelled ones', async () => {
    mockEventsList.mockResolvedValue({
      data: {
        items: [
          { id: 'a', status: 'confirmed', summary: 'Private Lesson - Ola', start: { dateTime: '2026-06-20T10:00:00+02:00' }, end: { dateTime: '2026-06-20T11:00:00+02:00' } },
          { id: 'b', status: 'cancelled', summary: 'Cancelled', start: { dateTime: '2026-06-21T10:00:00+02:00' } },
          { id: 'c', status: 'confirmed', summary: 'All day', start: { date: '2026-06-22' } },
        ],
      },
    })

    const result = await syncBookings()

    expect(result.synced).toBe(1)
    expect(mockDb.insert).toHaveBeenCalledTimes(1)
  })

  it('maps an event onto an activity row', async () => {
    const valuesSpy = vi.fn().mockReturnValue({ onConflictDoUpdate: vi.fn().mockResolvedValue(undefined) })
    mockDb.insert.mockReturnValue({ values: valuesSpy })
    mockEventsList.mockResolvedValue({
      data: {
        items: [
          { id: 'evt1', status: 'confirmed', summary: 'Private Lesson - Ola Nordmann', location: 'Ekeberg', start: { dateTime: '2026-06-20T10:00:00+02:00' }, end: { dateTime: '2026-06-20T11:00:00+02:00' } },
        ],
      },
    })

    await syncBookings()

    const row = valuesSpy.mock.calls[0][0]
    expect(row.source).toBe('acuity')
    expect(row.externalId).toBe('evt1')
    expect(row.activityType).toBe('Private Lesson')
    expect(row.clientName).toBe('Ola Nordmann')
    expect(row.location).toBe('Ekeberg')
  })

  it('reconciles cancellations by deleting in-window rows not present', async () => {
    mockEventsList.mockResolvedValue({ data: { items: [] } })
    mockDb.delete.mockReturnValue({
      where: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([{ id: 9 }, { id: 10 }]) }),
    })

    const result = await syncBookings()

    expect(result.synced).toBe(0)
    expect(result.canceled).toBe(2)
    expect(mockDb.delete).toHaveBeenCalled()
  })
})
