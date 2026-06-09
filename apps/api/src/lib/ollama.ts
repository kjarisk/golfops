const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://host.docker.internal:11434'
const EMBEDDING_MODEL = process.env.OLLAMA_EMBEDDING_MODEL ?? 'embeddinggemma:300m'

export async function getEmbedding(text: string): Promise<number[]> {
  const res = await fetch(`${OLLAMA_URL}/api/embed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: EMBEDDING_MODEL, input: text }),
  })
  if (!res.ok) throw new Error(`Ollama embed failed: ${res.status} ${res.statusText}`)
  const data = (await res.json()) as { embeddings: number[][] }
  return data.embeddings[0]
}

export function isOllamaConfigured(): boolean {
  return true // always attempt; fail gracefully at call time
}
