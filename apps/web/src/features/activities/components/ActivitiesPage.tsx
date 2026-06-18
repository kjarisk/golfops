import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  useActivities,
  usePatchActivity,
  useBookingStatus,
  useSyncBookings,
} from '../api/useActivities'
import type { Activity, BookingSource } from '../types'
import { ActivityForm } from './ActivityForm'

type SourceFilter = 'all' | BookingSource

function SourceBadge({ source }: { source: BookingSource }) {
  return source === 'acuity' ? (
    <span className="inline-flex items-center rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
      Acuity
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
      Manual
    </span>
  )
}

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
  const { data: bookingStatus } = useBookingStatus()
  const sync = useSyncBookings()
  const [formOpen, setFormOpen] = useState(false)
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const filtered = useMemo(() => {
    return (activities ?? []).filter((a) => {
      if (sourceFilter !== 'all' && a.source !== sourceFilter) return false
      if (fromDate && a.startTime < fromDate) return false
      // include the whole "to" day by comparing against its end
      if (toDate && a.startTime > `${toDate}T23:59:59`) return false
      return true
    })
  }, [activities, sourceFilter, fromDate, toDate])

  function handleSync() {
    sync.mutate(undefined, {
      onSuccess: (r) =>
        toast.success(
          `Synced ${r.synced} booking${r.synced === 1 ? '' : 's'}` +
            (r.canceled ? `, removed ${r.canceled} canceled` : '')
        ),
      onError: (e) => toast.error(e.message),
    })
  }

  if (isLoading) return <LoadingState />
  if (error) return <ErrorState error={error as Error} />

  return (
    <div className="min-h-svh bg-background px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Activities &amp; bookings
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {filtered.length} of {activities?.length ?? 0} shown
            </p>
          </div>
          <div className="flex items-center gap-2">
            {bookingStatus?.configured && (
              <Button
                variant="outline"
                onClick={handleSync}
                disabled={sync.isPending}
              >
                {sync.isPending ? 'Syncing…' : 'Sync now'}
              </Button>
            )}
            <Button onClick={() => setFormOpen(true)}>Add activity</Button>
          </div>
        </div>
        <ActivityForm open={formOpen} onClose={() => setFormOpen(false)} />

        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="source-filter"
              className="text-xs font-medium text-muted-foreground"
            >
              Source
            </label>
            <select
              id="source-filter"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as SourceFilter)}
              className="h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All</option>
              <option value="manual">Manual</option>
              <option value="acuity">Acuity</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="from-date"
              className="text-xs font-medium text-muted-foreground"
            >
              From
            </label>
            <input
              id="from-date"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="to-date"
              className="text-xs font-medium text-muted-foreground"
            >
              To
            </label>
            <input
              id="to-date"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          {(sourceFilter !== 'all' || fromDate || toDate) && (
            <button
              onClick={() => {
                setSourceFilter('all')
                setFromDate('')
                setToDate('')
              }}
              className="h-9 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          (activities?.length ?? 0) > 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card px-8 py-16 text-center">
              <p className="text-sm font-medium text-foreground">
                No activities match the current filters
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Try clearing the source or date filters.
              </p>
            </div>
          ) : (
            <EmptyState />
          )
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground"
                  >
                    Source
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground"
                  >
                    Activity
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground"
                  >
                    Type
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground"
                  >
                    Location
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground"
                  >
                    Participants
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground"
                  >
                    Trainers
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground"
                  >
                    GolfBox
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((activity) => (
                  <tr
                    key={activity.id}
                    className="transition-colors hover:bg-muted/20"
                  >
                    <td className="px-4 py-3">
                      <SourceBadge source={activity.source} />
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {activity.title}
                      {activity.clientName && (
                        <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                          {activity.clientName}
                        </span>
                      )}
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
                      {activity.source === 'acuity' &&
                      activity.trainers.length === 0 ? (
                        <span className="text-muted-foreground/40">—</span>
                      ) : activity.trainers.length === 0 ? (
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
