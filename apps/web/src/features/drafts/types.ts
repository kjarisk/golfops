export type DraftStatus = 'pending' | 'approved' | 'discarded'

export interface EmailDraft {
  id: number
  subject: string
  to: string
  body: string
  status: DraftStatus
  sourceThreadId: string | null
  createdAt: string
  updatedAt: string
}

export interface GmailThread {
  id: string
  subject: string
  from: string
  date: string
  messageCount: number
}

export interface GmailStatus {
  connected: boolean
  configured: boolean
}
