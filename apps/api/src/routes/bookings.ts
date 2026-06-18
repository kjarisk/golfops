import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { isAcuityConfigured, createAppointment } from '../lib/acuity'
import { syncBookings } from '../lib/bookingSync'

const CreateBookingSchema = z.object({
  appointmentTypeID: z.number().int().positive(),
  datetime: z.string().min(1),
  firstName: z.string().min(1).max(255),
  lastName: z.string().min(1).max(255),
  email: z.string().email().optional(),
  phone: z.string().max(50).optional(),
  calendarID: z.number().int().positive().optional(),
})

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

  // Create a booking in Acuity, then sync so it appears as an activity row.
  app.post('/api/bookings', async (request, reply) => {
    if (!isAcuityConfigured()) {
      return reply.status(503).send({ error: 'Acuity not configured' })
    }
    const body = CreateBookingSchema.parse(request.body)
    const appointment = await createAppointment(body)
    await syncBookings()
    return reply.status(201).send(appointment)
  })
}
