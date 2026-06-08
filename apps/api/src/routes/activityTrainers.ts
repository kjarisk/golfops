import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { and, eq } from 'drizzle-orm'
import { db } from '../db/index'
import { activities, trainers, activityTrainers } from '../db/schema'

const AssignTrainerSchema = z.object({
  trainerId: z.number().int().positive(),
})

export async function activityTrainerRoutes(app: FastifyInstance) {
  app.post('/api/activities/:id/trainers', async (request, reply) => {
    const { id } = request.params as { id: string }
    const { trainerId } = AssignTrainerSchema.parse(request.body)

    const [activity] = await db
      .select({ id: activities.id })
      .from(activities)
      .where(eq(activities.id, Number(id)))
    if (!activity) return reply.status(404).send({ error: 'Activity not found' })

    const [trainer] = await db
      .select({ id: trainers.id })
      .from(trainers)
      .where(eq(trainers.id, trainerId))
    if (!trainer) return reply.status(404).send({ error: 'Trainer not found' })

    await db
      .insert(activityTrainers)
      .values({ activityId: Number(id), trainerId })
      .onConflictDoNothing()

    return reply.status(201).send({ activityId: Number(id), trainerId })
  })

  app.delete('/api/activities/:id/trainers/:trainerId', async (request, reply) => {
    const { id, trainerId } = request.params as { id: string; trainerId: string }

    await db
      .delete(activityTrainers)
      .where(
        and(
          eq(activityTrainers.activityId, Number(id)),
          eq(activityTrainers.trainerId, Number(trainerId))
        )
      )

    return reply.status(204).send()
  })
}
