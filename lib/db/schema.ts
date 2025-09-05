import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

// Better Auth tables
export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('emailVerified', { mode: 'boolean' }).notNull().default(false),
  image: text('image'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
})

export const account = sqliteTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: integer('accessTokenExpiresAt', { mode: 'timestamp' }),
  refreshTokenExpiresAt: integer('refreshTokenExpiresAt', { mode: 'timestamp' }),
  scope: text('scope'),
  password: text('password'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const verification = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// Campaigns table
export const campaigns = sqliteTable('campaigns', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  status: text('status').notNull().default('draft'),
  description: text('description'),
  totalLeads: integer('total_leads').default(0),
  successfulLeads: integer('successful_leads').default(0),
  responseRate: real('response_rate').default(0.0),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

// Leads table (LinkedIn-style)
export const leads = sqliteTable('leads', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  company: text('company'),
  position: text('position'),
  linkedinUrl: text('linkedin_url'),
  profileImage: text('profile_image'),
  location: text('location'),
  status: text('status').notNull().default('pending'), // pending, contacted, responded, qualified, nurturing, converted
  connectionStatus: text('connection_status').default('not_connected'), // not_connected, request_sent, connected, request_received, do_not_contact
  sequenceStep: integer('sequence_step').default(0), // 0: not started, 1: connection request, 2: follow-up 1, etc.
  lastContactDate: integer('last_contact_date', { mode: 'timestamp' }),
  lastActivity: text('last_activity'), // "Connection request sent", "Message replied", etc.
  lastActivityDate: integer('last_activity_date', { mode: 'timestamp' }),
  notes: text('notes'),
  campaignId: text('campaign_id').notNull().references(() => campaigns.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

// LinkedIn Accounts table
export const linkedinAccounts = sqliteTable('linkedin_accounts', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  linkedinUrl: text('linkedin_url').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  dailyLimit: integer('daily_limit').default(50),
  weeklyLimit: integer('weekly_limit').default(200),
  currentDailyCount: integer('current_daily_count').default(0),
  currentWeeklyCount: integer('current_weekly_count').default(0),
  lastResetDate: integer('last_reset_date', { mode: 'timestamp' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

// Campaign Sequences table
export const campaignSequences = sqliteTable('campaign_sequences', {
  id: text('id').primaryKey(),
  campaignId: text('campaign_id').notNull().references(() => campaigns.id, { onDelete: 'cascade' }),
  stepNumber: integer('step_number').notNull(),
  stepType: text('step_type').notNull(), // 'connection_request', 'follow_up_message', 'email'
  title: text('title').notNull(),
  content: text('content').notNull(),
  delayDays: integer('delay_days').default(0),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

// Activity Logs table
export const activityLogs = sqliteTable('activity_logs', {
  id: text('id').primaryKey(),
  leadId: text('lead_id').references(() => leads.id, { onDelete: 'cascade' }),
  campaignId: text('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }),
  activityType: text('activity_type').notNull(), // 'connection_request_sent', 'message_sent', 'profile_viewed', etc.
  description: text('description').notNull(),
  metadata: text('metadata'), // JSON string for additional data
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

// Messages table
export const messages = sqliteTable('messages', {
  id: text('id').primaryKey(),
  leadId: text('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),
  campaignId: text('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }),
  sequenceStepId: text('sequence_step_id').references(() => campaignSequences.id),
  messageType: text('message_type').notNull(), // 'connection_request', 'follow_up', 'email'
  subject: text('subject'),
  content: text('content').notNull(),
  status: text('status').default('draft'), // draft, sent, delivered, read, replied
  sentAt: integer('sent_at', { mode: 'timestamp' }),
  readAt: integer('read_at', { mode: 'timestamp' }),
  repliedAt: integer('replied_at', { mode: 'timestamp' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export type User = typeof user.$inferSelect
export type Campaign = typeof campaigns.$inferSelect
export type Lead = typeof leads.$inferSelect
export type NewCampaign = typeof campaigns.$inferInsert
export type NewLead = typeof leads.$inferInsert