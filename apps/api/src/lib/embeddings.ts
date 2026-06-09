import { eq } from 'drizzle-orm'
import { db } from '../db/index'
import { documentChunks, knowledgeDocuments } from '../db/schema'
import { getEmbedding } from './ollama'
import { chunkText } from './chunker'

export async function indexDocument(documentId: number, content: string): Promise<void> {
  await db.delete(documentChunks).where(eq(documentChunks.documentId, documentId))

  const chunks = chunkText(content)
  for (let i = 0; i < chunks.length; i++) {
    const embedding = await getEmbedding(chunks[i])
    await db.insert(documentChunks).values({
      documentId,
      chunkIndex: i,
      content: chunks[i],
      embedding,
    })
  }
}

export async function reindexAll(): Promise<{ indexed: number; errors: number }> {
  const docs = await db.select().from(knowledgeDocuments)
  let indexed = 0
  let errors = 0

  for (const doc of docs) {
    try {
      await indexDocument(doc.id, doc.content)
      indexed++
    } catch {
      errors++
    }
  }

  return { indexed, errors }
}
