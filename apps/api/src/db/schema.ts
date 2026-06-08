import { pgTable, serial, varchar, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core'

export const activities = pgTable('activities', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  activityType: varchar('activity_type', { length: 100 }).notNull(),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }),
  location: varchar('location', { length: 255 }),
  capacity: integer('capacity'),
  participantCount: integer('participant_count').default(0).notNull(),
  requiresGolfboxReservation: boolean('requires_golfbox_reservation').default(false).notNull(),
  golfboxReservationCompleted: boolean('golfbox_reservation_completed').default(false).notNull(),
  golfboxReservationNote: text('golfbox_reservation_note'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export type Activity = typeof activities.$inferSelect
export type NewActivity = typeof activities.$inferInsert
