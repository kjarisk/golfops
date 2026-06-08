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

const port = Number(process.env.PORT ?? 3000)
const host = process.env.HOST ?? '0.0.0.0'

try {
  await app.listen({ port, host })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
