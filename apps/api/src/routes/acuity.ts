import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import {
  isAcuityConfigured,
  listAppointmentTypes,
  listCalendars,
  getAvailabilityDates,
  getAvailabilityTimes,
} from '../lib/acuity'

const DatesQuery = z.object({
  appointmentTypeID: z.coerce.number().int().positive(),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'month must be YYYY-MM'),
})

const TimesQuery = z.object({
  appointmentTypeID: z.coerce.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
})

/** Read-only Acuity lookups used by the new-booking flow. */
export async function acuityRoutes(app: FastifyInstance) {
  app.addHook('onRequest', async (_request, reply) => {
    if (!isAcuityConfigured()) {
      return reply.status(503).send({ error: 'Acuity not configured' })
    }
  })

  app.get('/api/acuity/appointment-types', async () => {
    const types = await listAppointmentTypes()
    return types.filter(t => t.active)
  })

  app.get('/api/acuity/calendars', async () => {
    return listCalendars()
  })

  app.get('/api/acuity/availability/dates', async (request) => {
    const { appointmentTypeID, month } = DatesQuery.parse(request.query)
    return getAvailabilityDates(appointmentTypeID, month)
  })

  app.get('/api/acuity/availability/times', async (request) => {
    const { appointmentTypeID, date } = TimesQuery.parse(request.query)
    return getAvailabilityTimes(appointmentTypeID, date)
  })
}
