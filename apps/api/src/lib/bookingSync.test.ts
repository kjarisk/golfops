import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { AcuityAppointment } from './acuity'

const { mockDb } = vi.hoisted(() => {
  const mockDb = {
    insert: vi.fn(),
    delete: vi.fn(),
  }
  return { mockDb }
})

vi.mock('../db/index', () => ({ db: mockDb }))
vi.mock('./acuity', () => ({ listAppointments: vi.fn() }))

import { listAppointments } from './acuity'
import { syncBookings } from './bookingSync'

function appt(over: Partial<AcuityAppointment> = {}): AcuityAppointment {
  return {
    id: 100,
    firstName: 'Ola',
    lastName: 'Nordmann',
    email: 'ola@example.com',
    phone: '+4790000000',
    datetime: '2026-06-20T10:00:00+0200',
    endTime: '2026-06-20T11:00:00+0200',
    type: 'Private Lesson',
    appointmentTypeID: 5,
    calendar: 'Kjartan',
    calendarID: 1,
    duration: '60',
    location: 'Ekebergbanen',
    price: '600',
    paid: 'yes',
    canceled: false,
    ...over,
  }
}

describe('syncBookings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // insert(...).values(...).onConflictDoUpdate(...) resolves
    mockDb.insert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        onConflictDoUpdate: vi.fn().mockResolvedValue(undefined),
      }),
    })
    // delete(...).where(...).returning(...) resolves to removed rows
    mockDb.delete.mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([]),
      }),
    })
  })

  it('upserts active appointments and reports the count', async () => {
    vi.mocked(listAppointments).mockResolvedValue([appt({ id: 100 }), appt({ id: 101 })])

    const result = await syncBookings()

    expect(result.synced).toBe(2)
    expect(result.canceled).toBe(0)
    expect(mockDb.insert).toHaveBeenCalledTimes(2)
    expect(mockDb.delete).not.toHaveBeenCalled()
  })

  it('deletes synced rows for canceled appointments', async () => {
    vi.mocked(listAppointments).mockResolvedValue([
      appt({ id: 100, canceled: false }),
      appt({ id: 200, canceled: true }),
    ])
    mockDb.delete.mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 7 }]),
      }),
    })

    const result = await syncBookings()

    expect(result.synced).toBe(1)
    expect(result.canceled).toBe(1)
    expect(mockDb.insert).toHaveBeenCalledTimes(1)
    expect(mockDb.delete).toHaveBeenCalledTimes(1)
  })

  it('maps client name and acuity fields onto the row', async () => {
    vi.mocked(listAppointments).mockResolvedValue([appt({ id: 100 })])
    const valuesSpy = vi.fn().mockReturnValue({ onConflictDoUpdate: vi.fn().mockResolvedValue(undefined) })
    mockDb.insert.mockReturnValue({ values: valuesSpy })

    await syncBookings()

    const row = valuesSpy.mock.calls[0][0]
    expect(row.source).toBe('acuity')
    expect(row.acuityId).toBe(100)
    expect(row.clientName).toBe('Ola Nordmann')
    expect(row.activityType).toBe('Private Lesson')
    expect(row.title).toBe('Private Lesson — Ola Nordmann')
  })
})
