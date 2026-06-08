import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { eq, asc } from 'drizzle-orm'
import { db } from '../db/index'
import { trainers } from '../db/schema'

const CreateTrainerSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().optional(),
})

const PatchTrainerSchema = CreateTrainerSchema.extend({
  active: z.boolean(),
}).partial()

export async function trainerRoutes(app: FastifyInstance) {
  app.get('/api/trainers', async () => {
    return db
      .select()
      .from(trainers)
      .where(eq(trainers.active, true))
      .orderBy(asc(trainers.name))
  })

  app.post('/api/trainers', async (request, reply) => {
    const body = CreateTrainerSchema.parse(request.body)
    const [trainer] = await db.insert(trainers).values(body).returning()
    return reply.status(201).send(trainer)
  })

  app.patch('/api/trainers/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = PatchTrainerSchema.parse(request.body)

    if (Object.keys(body).length === 0) {
      return reply.status(400).send({ error: 'No fields to update' })
    }

    const [trainer] = await db
      .update(trainers)
      .set(body)
      .where(eq(trainers.id, Number(id)))
      .returning()

    if (!trainer) return reply.status(404).send({ error: 'Trainer not found' })
    return trainer
  })
}
