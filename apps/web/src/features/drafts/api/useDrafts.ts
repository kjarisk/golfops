import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { EmailDraft, GmailThread, GmailStatus } from '../types'

async function fetchGmailStatus(): Promise<GmailStatus> {
  const res = await fetch('/api/auth/gmail/status')
  if (!res.ok) throw new Error('Failed to fetch Gmail status')
  return res.json() as Promise<GmailStatus>
}

async function fetchDrafts(): Promise<EmailDraft[]> {
  const res = await fetch('/api/drafts')
  if (!res.ok) throw new Error('Failed to fetch drafts')
  return res.json() as Promise<EmailDraft[]>
}

async function fetchThreads(): Promise<GmailThread[]> {
  const res = await fetch('/api/gmail/threads')
  if (!res.ok) return []
  return res.json() as Promise<GmailThread[]>
}

async function createDraft(input: {
  subject: string
  to: string
  body: string
  sourceThreadId?: string
}): Promise<EmailDraft> {
  const res = await fetch('/api/drafts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to create draft')
  return res.json() as Promise<EmailDraft>
}

async function updateDraftStatus(
  id: number,
  status: 'approved' | 'discarded'
): Promise<EmailDraft> {
  const res = await fetch(`/api/drafts/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw new Error(`Failed to ${status} draft`)
  return res.json() as Promise<EmailDraft>
}

export function useGmailStatus() {
  return useQuery({ queryKey: ['gmail-status'], queryFn: fetchGmailStatus })
}

export function useDrafts() {
  return useQuery({ queryKey: ['drafts'], queryFn: fetchDrafts })
}

export function useGmailThreads(enabled: boolean) {
  return useQuery({
    queryKey: ['gmail-threads'],
    queryFn: fetchThreads,
    enabled,
  })
}

export function useCreateDraft() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createDraft,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['drafts'] }),
  })
}

export function useUpdateDraftStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: number
      status: 'approved' | 'discarded'
    }) => updateDraftStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['drafts'] }),
  })
}
