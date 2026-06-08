export const KNOWLEDGE_CATEGORIES = [
  'Prices',
  'Opening hours',
  'VTG process',
  'Banespill rules',
  'Trainer details',
  'Club info',
  'FAQ',
] as const

export type KnowledgeCategory = (typeof KNOWLEDGE_CATEGORIES)[number]

export interface KnowledgeDocument {
  id: number
  title: string
  category: KnowledgeCategory
  content: string
  createdAt: string
  updatedAt: string
}
