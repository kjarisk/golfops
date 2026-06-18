import type { FastifyInstance } from 'fastify'
import { sql } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../db/index'

const HoursQuery = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

export async function reportRoutes(app: FastifyInstance) {
  app.get('/api/reports/activities', async () => {
    const [byTypeRows, thisMonthRows, totalsRows] = await Promise.all([
      db.execute(sql`
        SELECT
          activity_type,
          COUNT(*)::int AS total,
          COALESCE(SUM(participant_count), 0)::int AS total_participants
        FROM activities
        GROUP BY activity_type
        ORDER BY total DESC
      `),
      db.execute(sql`
        SELECT
          activity_type,
          COUNT(*)::int AS count,
          COALESCE(SUM(participant_count), 0)::int AS participants
        FROM activities
        WHERE start_time >= date_trunc('month', NOW())
        GROUP BY activity_type
        ORDER BY count DESC
      `),
      db.execute(sql`
        SELECT
          COUNT(*)::int AS activities,
          COALESCE(SUM(participant_count), 0)::int AS participants
        FROM activities
      `),
    ])

    return {
      byType: byTypeRows,
      thisMonth: thisMonthRows,
      totals: totalsRows[0] ?? { activities: 0, participants: 0 },
    }
  })

  app.get('/api/reports/trainers', async () => {
    const rows = await db.execute(sql`
      SELECT
        t.id,
        t.name,
        COUNT(DISTINCT at2.activity_id)::int AS activity_count,
        COALESCE(
          SUM(EXTRACT(EPOCH FROM (a.end_time - a.start_time)) / 60)::int,
          0
        ) AS total_minutes
      FROM trainers t
      LEFT JOIN activity_trainers at2 ON at2.trainer_id = t.id
      LEFT JOIN activities a ON a.id = at2.activity_id
      WHERE t.active = true
      GROUP BY t.id, t.name
      ORDER BY total_minutes DESC, t.name ASC
    `)

    return rows
  })

  // Charging report: Kjartan's lesson hours to invoice the club. Sums the
  // duration of Acuity-sourced bookings in a date range, grouped by type.
  // Defaults to the current month when no range is given.
  app.get('/api/reports/hours', async (request) => {
    const { from, to } = HoursQuery.parse(request.query)
    const fromSql = from ?? null
    const toSql = to ?? null

    const hoursExpr = sql`COALESCE(SUM(EXTRACT(EPOCH FROM (end_time - start_time)) / 3600.0), 0)`
    // Inclusive of the whole "to" day.
    const rangeFilter = sql`
      source = 'acuity'
      AND start_time >= COALESCE(${fromSql}::date, date_trunc('month', NOW()))
      AND start_time < COALESCE(${toSql}::date + INTERVAL '1 day', date_trunc('month', NOW()) + INTERVAL '1 month')
    `

    const [byTypeRows, totalsRows, rangeRows] = await Promise.all([
      db.execute(sql`
        SELECT
          activity_type,
          COUNT(*)::int AS lessons,
          ROUND(${hoursExpr}::numeric, 2)::float8 AS hours
        FROM activities
        WHERE ${rangeFilter}
        GROUP BY activity_type
        ORDER BY hours DESC
      `),
      db.execute(sql`
        SELECT
          COUNT(*)::int AS lessons,
          ROUND(${hoursExpr}::numeric, 2)::float8 AS hours
        FROM activities
        WHERE ${rangeFilter}
      `),
      db.execute(sql`
        SELECT
          MIN(start_time)::date::text AS from_date,
          MAX(start_time)::date::text AS to_date
        FROM activities
        WHERE ${rangeFilter}
      `),
    ])

    return {
      from: from ?? null,
      to: to ?? null,
      byType: byTypeRows,
      totals: totalsRows[0] ?? { lessons: 0, hours: 0 },
      range: rangeRows[0] ?? { from_date: null, to_date: null },
    }
  })
}
