import { useActivityReport, useTrainerReport } from '../api/useReports'

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
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                          Type
                        </th>
                        <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">
                          This month
                        </th>
                        <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">
                          All time
                        </th>
                        <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">
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
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                          Trainer
                        </th>
                        <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">
                          Activities
                        </th>
                        <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">
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
