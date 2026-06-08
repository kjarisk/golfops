import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { eq, asc } from 'drizzle-orm'
import { db } from '../db/index'
import { knowledgeDocuments } from '../db/schema'

export const KNOWLEDGE_CATEGORIES = [
  'Prices',
  'Opening hours',
  'VTG process',
  'Banespill rules',
  'Trainer details',
  'Club info',
  'FAQ',
] as const

const CreateDocumentSchema = z.object({
  title: z.string().min(1).max(255),
  category: z.enum(KNOWLEDGE_CATEGORIES),
  content: z.string().min(1),
})

const PatchDocumentSchema = CreateDocumentSchema.partial()

export async function knowledgeRoutes(app: FastifyInstance) {
  app.get('/api/knowledge', async () => {
    return db
      .select()
      .from(knowledgeDocuments)
      .orderBy(asc(knowledgeDocuments.category), asc(knowledgeDocuments.title))
  })

  app.post('/api/knowledge', async (request, reply) => {
    const body = CreateDocumentSchema.parse(request.body)
    const [doc] = await db.insert(knowledgeDocuments).values(body).returning()
    return reply.status(201).send(doc)
  })

  app.patch('/api/knowledge/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = PatchDocumentSchema.parse(request.body)

    if (Object.keys(body).length === 0) {
      return reply.status(400).send({ error: 'No fields to update' })
    }

    const [doc] = await db
      .update(knowledgeDocuments)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(knowledgeDocuments.id, Number(id)))
      .returning()

    if (!doc) return reply.status(404).send({ error: 'Document not found' })
    return doc
  })

  app.delete('/api/knowledge/:id', async (request, reply) => {
    const { id } = request.params as { id: string }

    const [doc] = await db
      .delete(knowledgeDocuments)
      .where(eq(knowledgeDocuments.id, Number(id)))
      .returning()

    if (!doc) return reply.status(404).send({ error: 'Document not found' })
    return reply.status(204).send()
  })
}
