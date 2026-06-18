import type { FastifyInstance } from 'fastify'
import { isBookingSyncConfigured, syncBookings } from '../lib/calendarBookings'

export async function bookingRoutes(app: FastifyInstance) {
  // Manual "Sync now" — pull bookings from the Acuity-synced Google Calendar.
  app.post('/api/bookings/sync', async (_request, reply) => {
    if (!isBookingSyncConfigured()) {
      return reply.status(503).send({ error: 'Booking sync not configured' })
    }
    try {
      return await syncBookings()
    } catch (err) {
      if ((err as Error).message === 'Gmail not connected') {
        return reply.status(401).send({ error: 'Google account not connected' })
      }
      throw err
    }
  })

  // Lightweight status for the UI to know whether to show the Sync button.
  app.get('/api/bookings/status', async () => {
    return { configured: isBookingSyncConfigured() }
  })
}
