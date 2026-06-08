import Fastify from 'fastify'
import cors from '@fastify/cors'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { db } from './db/index'
import { healthRoutes } from './routes/health'

const app = Fastify({ logger: true })

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

const port = Number(process.env.PORT ?? 3000)
const host = process.env.HOST ?? '0.0.0.0'

try {
  await app.listen({ port, host })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
