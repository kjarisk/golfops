import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { eq, asc, sql } from 'drizzle-orm'
import { db } from '../db/index'
import { knowledgeDocuments } from '../db/schema'
import { indexDocument, reindexAll } from '../lib/embeddings'
import { getEmbedding } from '../lib/ollama'

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
    // Index asynchronously — don't block the response
    indexDocument(doc.id, doc.content).catch((err) =>
      app.log.warn({ err }, 'Failed to index document %d', doc.id)
    )
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

    if (body.content) {
      indexDocument(doc.id, doc.content).catch((err) =>
        app.log.warn({ err }, 'Failed to re-index document %d', doc.id)
      )
    }

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

  app.get('/api/knowledge/search', async (request, reply) => {
    const { q } = request.query as { q?: string }
    if (!q || q.trim().length === 0) {
      return reply.status(400).send({ error: 'Missing query parameter q' })
    }

    let queryEmbedding: number[]
    try {
      queryEmbedding = await getEmbedding(q.trim())
    } catch (err) {
      app.log.warn({ err }, 'Ollama embedding failed for search query')
      return reply.status(503).send({ error: 'Embedding service unavailable' })
    }

    const vectorLiteral = `[${queryEmbedding.join(',')}]`

    const results = await db.execute(sql`
      SELECT
        kd.id,
        kd.title,
        kd.category,
        dc.content AS chunk,
        1 - (dc.embedding <=> ${vectorLiteral}::vector) AS similarity
      FROM document_chunks dc
      JOIN knowledge_documents kd ON kd.id = dc.document_id
      WHERE dc.embedding IS NOT NULL
      ORDER BY dc.embedding <=> ${vectorLiteral}::vector
      LIMIT 5
    `)

    return results
  })

  app.post('/api/knowledge/reindex', async () => {
    const result = await reindexAll()
    return result
  })
}
