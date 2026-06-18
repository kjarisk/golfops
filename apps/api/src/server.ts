import Fastify from 'fastify'
import cors from '@fastify/cors'
import { ZodError } from 'zod'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { db } from './db/index'
import { healthRoutes } from './routes/health'
import { activityRoutes } from './routes/activities'
import { trainerRoutes } from './routes/trainers'
import { activityTrainerRoutes } from './routes/activityTrainers'
import { knowledgeRoutes } from './routes/knowledge'
import { gmailRoutes } from './routes/gmail'
import { draftRoutes } from './routes/drafts'
import { reportRoutes } from './routes/reports'
import { bookingRoutes } from './routes/bookings'
import { isBookingSyncConfigured, syncBookings } from './lib/calendarBookings'

const app = Fastify({ logger: true })

app.setErrorHandler((error, _request, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({ error: 'Validation error', issues: error.issues })
  }
  app.log.error(error)
  return reply.status(500).send({ error: 'Internal server error' })
})

const migrationsFolder = import.meta.dirname + '/db/migrations'

for (let attempt = 1; attempt <= 5; attempt++) {
  try {
    await migrate(db, { migrationsFolder })
    app.log.info('Database migrations complete')
    break
  } catch (err) {
    if (attempt === 5) throw err
    app.log.warn(`DB not ready (attempt ${attempt}/5), retrying in 2s...`)
    await new Promise(r => setTimeout(r, 2000))
  }
}

await app.register(cors)
await app.register(healthRoutes)
await app.register(activityRoutes)
await app.register(trainerRoutes)
await app.register(activityTrainerRoutes)
await app.register(knowledgeRoutes)
await app.register(gmailRoutes)
await app.register(draftRoutes)
await app.register(reportRoutes)
await app.register(bookingRoutes)

// Mirror bookings from the Acuity-synced Google Calendar into our DB on a poll.
if (isBookingSyncConfigured()) {
  const SYNC_INTERVAL_MS = Number(process.env.BOOKINGS_SYNC_INTERVAL_MS ?? 5 * 60 * 1000)
  const runSync = () =>
    syncBookings()
      .then(r => app.log.info({ ...r }, 'Booking sync complete'))
      .catch(err => app.log.error(err, 'Booking sync failed'))
  runSync()
  setInterval(runSync, SYNC_INTERVAL_MS).unref()
}

const port = Number(process.env.PORT ?? 3000)
const host = process.env.HOST ?? '0.0.0.0'

try {
  await app.listen({ port, host })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
