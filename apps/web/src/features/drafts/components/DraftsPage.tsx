import { useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  useGmailStatus,
  useDrafts,
  useGmailThreads,
  useUpdateDraftStatus,
} from '../api/useDrafts'
import type { EmailDraft, DraftStatus } from '../types'
import { DraftForm } from './DraftForm'

const STATUS_TABS: { label: string; value: DraftStatus | 'all' }[] = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Discarded', value: 'discarded' },
]

const STATUS_STYLES: Record<DraftStatus, string> = {
  pending:
    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  approved:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  discarded: 'bg-muted text-muted-foreground',
}

function GmailBanner({
  configured,
  connected,
}: {
  configured: boolean
  connected: boolean
}) {
  if (connected) return null

  return (
    <div className="mb-6 flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4">
      <div>
        <p className="text-sm font-medium text-foreground">
          {configured ? 'Gmail not connected' : 'Gmail not configured'}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {configured
            ? 'Connect your Gmail account to send approved drafts.'
            : 'Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env to enable Gmail.'}
        </p>
      </div>
      {configured && (
        <a href="/api/auth/gmail">
          <Button size="sm">Connect Gmail</Button>
        </a>
      )}
    </div>
  )
}

function DraftCard({
  draft,
  onApprove,
  onDiscard,
  pending,
}: {
  draft: EmailDraft
  onApprove: () => void
  onDiscard: () => void
  pending: boolean
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-foreground truncate">
              {draft.subject}
            </span>
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                STATUS_STYLES[draft.status]
              )}
            >
              {draft.status}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">To: {draft.to}</p>
        </div>
        <p className="shrink-0 text-xs text-muted-foreground">
          {new Date(draft.createdAt).toLocaleDateString('nb-NO')}
        </p>
      </div>

      <button
        onClick={() => setExpanded((e) => !e)}
        className="mt-3 w-full text-left text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {expanded ? (
          <pre className="whitespace-pre-wrap font-sans">{draft.body}</pre>
        ) : (
          <span className="line-clamp-2">{draft.body}</span>
        )}
        <span className="mt-1 block text-xs text-primary">
          {expanded ? 'Show less' : 'Show more'}
        </span>
      </button>

      {draft.status === 'pending' && (
        <div className="mt-4 flex gap-2">
          <Button
            size="sm"
            disabled={pending}
            onClick={onApprove}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {pending ? 'Sending…' : 'Approve & send'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={onDiscard}
          >
            Discard
          </Button>
        </div>
      )}
    </div>
  )
}

function ThreadRow({
  thread,
  onDraft,
}: {
  thread: { id: string; subject: string; from: string; date: string }
  onDraft: () => void
}) {
  return (
    <tr className="transition-colors hover:bg-muted/20">
      <td className="px-4 py-3 font-medium text-foreground text-sm truncate max-w-xs">
        {thread.subject}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground truncate max-w-xs">
        {thread.from}
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
        {thread.date}
      </td>
      <td className="px-4 py-3">
        <Button size="sm" variant="ghost" onClick={onDraft}>
          Draft reply
        </Button>
      </td>
    </tr>
  )
}

export function DraftsPage() {
  const { data: gmailStatus } = useGmailStatus()
  const { data: drafts, isLoading, error } = useDrafts()
  const { data: threads } = useGmailThreads(gmailStatus?.connected ?? false)
  const updateStatus = useUpdateDraftStatus()

  const [activeTab, setActiveTab] = useState<DraftStatus>('pending')
  const [formOpen, setFormOpen] = useState(false)
  const [prefill, setPrefill] = useState<
    { to?: string; subject?: string; sourceThreadId?: string } | undefined
  >()

  function openDraftForThread(thread: {
    id: string
    subject: string
    from: string
  }) {
    const emailMatch = thread.from.match(/<(.+)>/)
    setPrefill({
      to: emailMatch?.[1] ?? thread.from,
      subject: thread.subject.startsWith('Re:')
        ? thread.subject
        : `Re: ${thread.subject}`,
      sourceThreadId: thread.id,
    })
    setFormOpen(true)
  }

  function handleApprove(id: number) {
    updateStatus.mutate(
      { id, status: 'approved' },
      {
        onSuccess: () => toast.success('Email sent'),
        onError: (err) => toast.error(err.message),
      }
    )
  }

  function handleDiscard(id: number) {
    updateStatus.mutate(
      { id, status: 'discarded' },
      { onSuccess: () => toast.success('Draft discarded') }
    )
  }

  const filtered = (drafts ?? []).filter((d) => d.status === activeTab)

  return (
    <div className="min-h-svh bg-background px-6 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Drafts
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {(drafts ?? []).filter((d) => d.status === 'pending').length}{' '}
              pending
            </p>
          </div>
          <Button
            onClick={() => {
              setPrefill(undefined)
              setFormOpen(true)
            }}
          >
            Compose draft
          </Button>
        </div>

        <GmailBanner
          configured={gmailStatus?.configured ?? false}
          connected={gmailStatus?.connected ?? false}
        />

        {gmailStatus?.connected && threads && threads.length > 0 && (
          <div className="mb-8 overflow-hidden rounded-xl border border-border bg-card">
            <div className="border-b border-border bg-muted/40 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Recent inbox threads
              </p>
            </div>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-border">
                {threads.map((t) => (
                  <ThreadRow
                    key={t.id}
                    thread={t}
                    onDraft={() => openDraftForThread(t)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mb-4 flex gap-1">
          {STATUS_TABS.map((tab) => {
            const count = (drafts ?? []).filter(
              (d) => d.status === tab.value
            ).length
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value as DraftStatus)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  activeTab === tab.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
                {count > 0 && (
                  <span className="ml-1.5 text-[10px] opacity-70">{count}</span>
                )}
              </button>
            )
          })}
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading drafts…</p>
        ) : error ? (
          <p className="text-sm text-destructive">
            Failed to load drafts: {(error as Error).message}
          </p>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card px-8 py-16 text-center">
            <p className="text-sm font-medium text-foreground">
              No {activeTab} drafts
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {activeTab === 'pending'
                ? 'Compose a new draft to get started.'
                : 'Nothing here yet.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((draft) => (
              <DraftCard
                key={draft.id}
                draft={draft}
                pending={updateStatus.isPending}
                onApprove={() => handleApprove(draft.id)}
                onDiscard={() => handleDiscard(draft.id)}
              />
            ))}
          </div>
        )}
      </div>

      <DraftForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setPrefill(undefined)
        }}
        prefill={prefill}
      />
    </div>
  )
}
