import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { KnowledgeDocument, KnowledgeCategory } from '../types'

type CreateInput = {
  title: string
  category: KnowledgeCategory
  content: string
}
type UpdateInput = Partial<CreateInput>

async function fetchDocuments(): Promise<KnowledgeDocument[]> {
  const res = await fetch('/api/knowledge')
  if (!res.ok) throw new Error('Failed to fetch documents')
  return res.json() as Promise<KnowledgeDocument[]>
}

async function createDocument(input: CreateInput): Promise<KnowledgeDocument> {
  const res = await fetch('/api/knowledge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to create document')
  return res.json() as Promise<KnowledgeDocument>
}

async function updateDocument(
  id: number,
  input: UpdateInput
): Promise<KnowledgeDocument> {
  const res = await fetch(`/api/knowledge/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to update document')
  return res.json() as Promise<KnowledgeDocument>
}

async function deleteDocument(id: number): Promise<void> {
  const res = await fetch(`/api/knowledge/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete document')
}

export function useDocuments() {
  return useQuery({ queryKey: ['knowledge'], queryFn: fetchDocuments })
}

export function useCreateDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createDocument,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['knowledge'] }),
  })
}

export function useUpdateDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...input }: { id: number } & UpdateInput) =>
      updateDocument(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['knowledge'] }),
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['knowledge'] }),
  })
}
