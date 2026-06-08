import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useActivities, usePatchActivity } from '../api/useActivities'
import type { Activity } from '../types'
import { ActivityForm } from './ActivityForm'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('nb-NO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function GolfBoxCell({
  activity,
  onToggle,
  onNoteChange,
  disabled,
}: {
  activity: Activity
  onToggle: () => void
  onNoteChange: (note: string) => void
  disabled: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [noteValue, setNoteValue] = useState(
    activity.golfboxReservationNote ?? ''
  )

  if (!activity.requiresGolfboxReservation) {
    return <span className="block text-center text-muted-foreground/30">—</span>
  }

  const done = activity.golfboxReservationCompleted

  function saveNote() {
    setEditing(false)
    const trimmed = noteValue.trim()
    if (trimmed !== (activity.golfboxReservationNote ?? '')) {
      onNoteChange(trimmed)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onToggle}
        disabled={disabled}
        aria-label={
          done
            ? 'Mark GolfBox reservation incomplete'
            : 'Mark GolfBox reservation complete'
        }
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
          done
            ? 'border-emerald-500 bg-emerald-500 text-white'
            : 'border-amber-500 bg-transparent'
        )}
      >
        {done && (
          <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path
              d="M2 6l3 3 5-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
      {editing ? (
        <input
          autoFocus
          value={noteValue}
          onChange={(e) => setNoteValue(e.target.value)}
          onBlur={saveNote}
          onKeyDown={(e) => {
            if (e.key === 'Enter') saveNote()
            if (e.key === 'Escape') {
              setNoteValue(activity.golfboxReservationNote ?? '')
              setEditing(false)
            }
          }}
          className="h-6 w-40 rounded border border-input bg-background px-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          placeholder="Add note…"
        />
      ) : (
        <button
          onClick={() => setEditing(true)}
          title={activity.golfboxReservationNote ?? 'Add note'}
          className="max-w-[10rem] truncate text-left text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:underline"
        >
          {activity.golfboxReservationNote || (
            <span className="text-muted-foreground/40">+ note</span>
          )}
        </button>
      )}
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">Loading activities…</p>
    </div>
  )
}

function ErrorState({ error }: { error: Error }) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background">
      <p className="text-sm text-destructive">
        Failed to load activities: {error.message}
      </p>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card px-8 py-16 text-center">
      <p className="text-sm font-medium text-foreground">No activities yet</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Add the first activity to get started.
      </p>
    </div>
  )
}

export function ActivitiesPage() {
  const { data: activities, isLoading, error } = useActivities()
  const patch = usePatchActivity()
  const [formOpen, setFormOpen] = useState(false)

  if (isLoading) return <LoadingState />
  if (error) return <ErrorState error={error as Error} />

  return (
    <div className="min-h-svh bg-background px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Activities
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {activities?.length ?? 0} upcoming
            </p>
          </div>
          <Button onClick={() => setFormOpen(true)}>Add activity</Button>
        </div>
        <ActivityForm open={formOpen} onClose={() => setFormOpen(false)} />

        {activities?.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Activity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Location
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Participants
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Trainers
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    GolfBox
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {activities?.map((activity) => (
                  <tr
                    key={activity.id}
                    className="transition-colors hover:bg-muted/20"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">
                      {activity.title}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                        {activity.activityType}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {formatDate(activity.startTime)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {activity.location ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground">
                      {activity.participantCount}
                      {activity.capacity != null ? `/${activity.capacity}` : ''}
                    </td>
                    <td className="px-4 py-3">
                      {activity.trainers.length === 0 ? (
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          Unassigned
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {activity.trainers.map((t) => (
                            <span
                              key={t.id}
                              className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground"
                            >
                              {t.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <GolfBoxCell
                        activity={activity}
                        disabled={patch.isPending}
                        onToggle={() =>
                          patch.mutate({
                            id: activity.id,
                            data: {
                              golfboxReservationCompleted:
                                !activity.golfboxReservationCompleted,
                            },
                          })
                        }
                        onNoteChange={(note) =>
                          patch.mutate({
                            id: activity.id,
                            data: { golfboxReservationNote: note },
                          })
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
