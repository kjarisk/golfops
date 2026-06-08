import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { eq, desc } from 'drizzle-orm'
import { google } from 'googleapis'
import { db } from '../db/index'
import { emailDrafts } from '../db/schema'
import { getAuthenticatedClient } from '../lib/gmail'

const CreateDraftSchema = z.object({
  subject: z.string().min(1).max(255),
  to: z.string().email(),
  body: z.string().min(1),
  sourceThreadId: z.string().optional(),
})

const UpdateDraftSchema = z.object({
  status: z.enum(['approved', 'discarded']),
})

export async function draftRoutes(app: FastifyInstance) {
  app.get('/api/drafts', async (request) => {
    const { status } = request.query as { status?: string }
    if (status) {
      return db
        .select()
        .from(emailDrafts)
        .where(eq(emailDrafts.status, status))
        .orderBy(desc(emailDrafts.createdAt))
    }
    return db.select().from(emailDrafts).orderBy(desc(emailDrafts.createdAt))
  })

  app.post('/api/drafts', async (request, reply) => {
    const body = CreateDraftSchema.parse(request.body)
    const [draft] = await db
      .insert(emailDrafts)
      .values({ ...body, to: body.to })
      .returning()
    return reply.status(201).send(draft)
  })

  app.patch('/api/drafts/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const { status } = UpdateDraftSchema.parse(request.body)

    const [draft] = await db
      .select()
      .from(emailDrafts)
      .where(eq(emailDrafts.id, Number(id)))

    if (!draft) return reply.status(404).send({ error: 'Draft not found' })
    if (draft.status !== 'pending') {
      return reply.status(400).send({ error: 'Draft already processed' })
    }

    if (status === 'approved') {
      const auth = await getAuthenticatedClient()
      const gmail = google.gmail({ version: 'v1', auth })

      const raw = [
        `To: ${draft.to}`,
        `Subject: ${draft.subject}`,
        'Content-Type: text/plain; charset=utf-8',
        '',
        draft.body,
      ].join('\r\n')

      const encoded = Buffer.from(raw).toString('base64url')

      await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encoded,
          ...(draft.sourceThreadId ? { threadId: draft.sourceThreadId } : {}),
        },
      })
    }

    const [updated] = await db
      .update(emailDrafts)
      .set({ status, updatedAt: new Date() })
      .where(eq(emailDrafts.id, Number(id)))
      .returning()

    return updated
  })

  app.delete('/api/drafts/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const [draft] = await db
      .delete(emailDrafts)
      .where(eq(emailDrafts.id, Number(id)))
      .returning()
    if (!draft) return reply.status(404).send({ error: 'Draft not found' })
    return reply.status(204).send()
  })
}
