import type { FastifyInstance } from 'fastify'
import { isAcuityConfigured } from '../lib/acuity'
import { syncBookings } from '../lib/bookingSync'

export async function bookingRoutes(app: FastifyInstance) {
  // Manual "Sync now" — pull Acuity appointments into the activities table.
  app.post('/api/bookings/sync', async (_request, reply) => {
    if (!isAcuityConfigured()) {
      return reply.status(503).send({ error: 'Acuity not configured' })
    }
    const result = await syncBookings()
    return result
  })

  // Lightweight status for the UI to know whether to show the Sync button.
  app.get('/api/bookings/status', async () => {
    return { configured: isAcuityConfigured() }
  })
}
