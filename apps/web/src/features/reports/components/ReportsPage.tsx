import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  useActivityReport,
  useTrainerReport,
  useHoursReport,
} from '../api/useReports'

function formatHours(hours: number) {
  if (!hours) return '—'
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

function ChargingReport() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const { data, isLoading, error } = useHoursReport(from, to)

  const rangeLabel = useMemo(() => {
    if (from || to) return `${from || '…'} → ${to || '…'}`
    return 'Current month'
  }, [from, to])

  function exportCsv() {
    if (!data) return
    const rows = [
      ['Activity type', 'Lessons', 'Hours'],
      ...data.byType.map((r) => [
        r.activity_type,
        String(r.lessons),
        String(r.hours),
      ]),
      ['Total', String(data.totals.lessons), String(data.totals.hours)],
    ]
    const csv = rows
      .map((cols) => cols.map((c) => `"${c.replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `golfops-hours-${from || 'month'}_${to || ''}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section>
      <SectionHeader title="Charging — lesson hours to invoice" />
      <div className="mt-3 mb-4 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="hours-from"
            className="text-xs font-medium text-muted-foreground"
          >
            From
          </label>
          <input
            id="hours-from"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="hours-to"
            className="text-xs font-medium text-muted-foreground"
          >
            To
          </label>
          <input
            id="hours-to"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Button
          variant="outline"
          onClick={exportCsv}
          disabled={!data || data.byType.length === 0}
        >
          Export CSV
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {isLoading ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            Loading…
          </p>
        ) : error ? (
          <p className="px-5 py-8 text-center text-sm text-destructive">
            {(error as Error).message}
          </p>
        ) : !data || data.byType.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            No Acuity bookings in {rangeLabel.toLowerCase()}.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th
                  scope="col"
                  className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground"
                >
                  Activity type
                </th>
                <th
                  scope="col"
                  className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground"
                >
                  Lessons
                </th>
                <th
                  scope="col"
                  className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground"
                >
                  Hours
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.byType.map((row) => (
                <tr
                  key={row.activity_type}
                  className="transition-colors hover:bg-muted/20"
                >
                  <td className="px-4 py-3 font-medium text-foreground">
                    {row.activity_type}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                    {row.lessons}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-foreground">
                    {formatHours(row.hours)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border bg-muted/30 font-semibold">
                <td className="px-4 py-3 text-foreground">Total</td>
                <td className="px-4 py-3 text-right tabular-nums text-foreground">
                  {data.totals.lessons}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-foreground">
                  {formatHours(data.totals.hours)}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </section>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-card px-5 py-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
        {value}
      </p>
    </div>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
      {title}
    </h2>
  )
}

export function ReportsPage() {
  const {
    data: activityReport,
    isLoading: loadingActivities,
    error: activityError,
  } = useActivityReport()
  const {
    data: trainers,
    isLoading: loadingTrainers,
    error: trainerError,
  } = useTrainerReport()

  const isLoading = loadingActivities || loadingTrainers
  const error = activityError ?? trainerError

  return (
    <div className="min-h-svh bg-background px-6 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Reports
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Activity and trainer summary
          </p>
        </div>

        <div className="mb-10">
          <ChargingReport />
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : error ? (
          <p className="text-sm text-destructive">
            Failed to load reports: {(error as Error).message}
          </p>
        ) : (
          <div className="flex flex-col gap-10">
            {/* Summary cards */}
            <section>
              <SectionHeader title="All time" />
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard
                  label="Total activities"
                  value={activityReport?.totals.activities ?? 0}
                />
                <StatCard
                  label="Total participants"
                  value={activityReport?.totals.participants ?? 0}
                />
                <StatCard
                  label="Activity types"
                  value={activityReport?.byType.length ?? 0}
                />
                <StatCard
                  label="Active trainers"
                  value={trainers?.length ?? 0}
                />
              </div>
            </section>

            {/* Activities by type */}
            <section>
              <SectionHeader title="Activities by type" />
              <div className="mt-3 overflow-hidden rounded-xl border border-border bg-card">
                {!activityReport?.byType.length ? (
                  <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                    No activities yet
                  </p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/40">
                        <th
                          scope="col"
                          className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground"
                        >
                          Type
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground"
                        >
                          This month
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground"
                        >
                          All time
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground"
                        >
                          Participants
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {activityReport.byType.map((row) => {
                        const monthRow = activityReport.thisMonth.find(
                          (m) => m.activity_type === row.activity_type
                        )
                        return (
                          <tr
                            key={row.activity_type}
                            className="hover:bg-muted/20 transition-colors"
                          >
                            <td className="px-4 py-3 font-medium text-foreground">
                              {row.activity_type}
                            </td>
                            <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                              {monthRow?.count ?? 0}
                            </td>
                            <td className="px-4 py-3 text-right tabular-nums text-foreground">
                              {row.total}
                            </td>
                            <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                              {row.total_participants}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </section>

            {/* Trainer hours */}
            <section>
              <SectionHeader title="Trainer hours" />
              <div className="mt-3 overflow-hidden rounded-xl border border-border bg-card">
                {!trainers?.length ? (
                  <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                    No active trainers
                  </p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/40">
                        <th
                          scope="col"
                          className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground"
                        >
                          Trainer
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground"
                        >
                          Activities
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground"
                        >
                          Hours
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {trainers.map((t) => {
                        const hours = Math.floor(t.total_minutes / 60)
                        const mins = t.total_minutes % 60
                        const display =
                          t.total_minutes === 0
                            ? '—'
                            : mins === 0
                              ? `${hours}h`
                              : `${hours}h ${mins}m`
                        return (
                          <tr
                            key={t.id}
                            className="hover:bg-muted/20 transition-colors"
                          >
                            <td className="px-4 py-3 font-medium text-foreground">
                              {t.name}
                            </td>
                            <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                              {t.activity_count}
                            </td>
                            <td className="px-4 py-3 text-right tabular-nums text-foreground">
                              {display}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
