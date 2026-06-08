import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { eq, asc } from 'drizzle-orm'
import { db } from '../db/index'
import { activities, trainers, activityTrainers } from '../db/schema'

const dateField = z.string().datetime().transform(s => new Date(s))

const CreateActivitySchema = z.object({
  title: z.string().min(1).max(255),
  activityType: z.string().min(1).max(100),
  startTime: dateField,
  endTime: dateField.optional(),
  location: z.string().max(255).optional(),
  capacity: z.number().int().positive().optional(),
  participantCount: z.number().int().min(0).optional(),
  requiresGolfboxReservation: z.boolean().optional(),
  golfboxReservationCompleted: z.boolean().optional(),
  golfboxReservationNote: z.string().optional(),
})

const PatchActivitySchema = CreateActivitySchema.partial()

export async function activityRoutes(app: FastifyInstance) {
  app.get('/api/activities', async () => {
    const allActivities = await db
      .select()
      .from(activities)
      .orderBy(asc(activities.startTime))

    if (allActivities.length === 0) return []

    const assignments = await db
      .select({
        activityId: activityTrainers.activityId,
        trainerId: trainers.id,
        trainerName: trainers.name,
      })
      .from(activityTrainers)
      .innerJoin(trainers, eq(activityTrainers.trainerId, trainers.id))

    return allActivities.map(a => ({
      ...a,
      trainers: assignments
        .filter(r => r.activityId === a.id)
        .map(r => ({ id: r.trainerId, name: r.trainerName })),
    }))
  })

  app.post('/api/activities', async (request, reply) => {
    const body = CreateActivitySchema.parse(request.body)
    const [activity] = await db.insert(activities).values(body).returning()
    return reply.status(201).send(activity)
  })

  app.patch('/api/activities/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = PatchActivitySchema.parse(request.body)

    if (Object.keys(body).length === 0) {
      return reply.status(400).send({ error: 'No fields to update' })
    }

    const [activity] = await db
      .update(activities)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(activities.id, Number(id)))
      .returning()

    if (!activity) {
      return reply.status(404).send({ error: 'Activity not found' })
    }

    return activity
  })
}
