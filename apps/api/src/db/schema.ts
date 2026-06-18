import { pgTable, serial, varchar, text, integer, boolean, timestamp, primaryKey, customType } from 'drizzle-orm/pg-core'

const vector = customType<{ data: number[]; driverData: string; config: { dimensions: number } }>({
  dataType(config) {
    return `vector(${config?.dimensions ?? 768})`
  },
  toDriver(value: number[]): string {
    return `[${value.join(',')}]`
  },
  fromDriver(value: string): number[] {
    return value.slice(1, -1).split(',').map(Number)
  },
})

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
  // Booking source: 'manual' (created in golfops) or 'acuity' (mirrored from Acuity Scheduling).
  source: varchar('source', { length: 20 }).default('manual').notNull(),
  // Synced-booking fields (null for manual rows). externalId is the upsert key —
  // the Google Calendar event id of an Acuity-synced lesson.
  externalId: varchar('external_id', { length: 255 }).unique(),
  acuityCalendar: varchar('acuity_calendar', { length: 255 }),
  // Deprecated: from the direct-Acuity-API approach (now synced via Google Calendar).
  acuityId: integer('acuity_id').unique(),
  acuityTypeId: integer('acuity_type_id'),
  clientName: varchar('client_name', { length: 255 }),
  clientEmail: varchar('client_email', { length: 255 }),
  clientPhone: varchar('client_phone', { length: 50 }),
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

export const oauthTokens = pgTable('oauth_tokens', {
  id: serial('id').primaryKey(),
  provider: varchar('provider', { length: 50 }).notNull().unique(),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const emailDrafts = pgTable('email_drafts', {
  id: serial('id').primaryKey(),
  subject: varchar('subject', { length: 255 }).notNull(),
  to: varchar('to_address', { length: 255 }).notNull(),
  body: text('body').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  sourceThreadId: varchar('source_thread_id', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export type EmailDraft = typeof emailDrafts.$inferSelect
export type NewEmailDraft = typeof emailDrafts.$inferInsert

export const documentChunks = pgTable('document_chunks', {
  id: serial('id').primaryKey(),
  documentId: integer('document_id')
    .notNull()
    .references(() => knowledgeDocuments.id, { onDelete: 'cascade' }),
  chunkIndex: integer('chunk_index').notNull(),
  content: text('content').notNull(),
  embedding: vector('embedding', { dimensions: 768 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})
