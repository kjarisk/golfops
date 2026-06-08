import { pgTable, serial, varchar, text, integer, boolean, timestamp, primaryKey } from 'drizzle-orm/pg-core'

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

export const trainers = pgTable('trainers', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export type Trainer = typeof trainers.$inferSelect
export type NewTrainer = typeof trainers.$inferInsert

export const activityTrainers = pgTable(
  'activity_trainers',
  {
    activityId: integer('activity_id')
      .notNull()
      .references(() => activities.id, { onDelete: 'cascade' }),
    trainerId: integer('trainer_id')
      .notNull()
      .references(() => trainers.id, { onDelete: 'cascade' }),
  },
  t => [primaryKey({ columns: [t.activityId, t.trainerId] })]
)

export type ActivityTrainer = typeof activityTrainers.$inferSelect

export const knowledgeDocuments = pgTable('knowledge_documents', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export type KnowledgeDocument = typeof knowledgeDocuments.$inferSelect
export type NewKnowledgeDocument = typeof knowledgeDocuments.$inferInsert
