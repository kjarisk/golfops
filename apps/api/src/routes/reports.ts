import type { FastifyInstance } from 'fastify'
import { sql } from 'drizzle-orm'
import { db } from '../db/index'

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
}
