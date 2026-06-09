const MAX_CHUNK_CHARS = 500
const OVERLAP_CHARS = 50

export function chunkText(text: string): string[] {
  // Split on paragraph boundaries first
  const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)

  const chunks: string[] = []

  for (const para of paragraphs) {
    if (para.length <= MAX_CHUNK_CHARS) {
      chunks.push(para)
      continue
    }
    // Long paragraph: split on sentence boundaries
    const sentences = para.match(/[^.!?]+[.!?]+/g) ?? [para]
    let current = ''
    for (const sentence of sentences) {
      if ((current + ' ' + sentence).length > MAX_CHUNK_CHARS && current) {
        chunks.push(current.trim())
        // carry overlap into next chunk
        const words = current.split(' ')
        current = words.slice(-Math.ceil(OVERLAP_CHARS / 6)).join(' ') + ' ' + sentence
      } else {
        current = current ? current + ' ' + sentence : sentence
      }
    }
    if (current.trim()) chunks.push(current.trim())
  }

  return chunks.filter((c) => c.length > 0)
}
