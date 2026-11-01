import { pgTable, text, integer, timestamp, json, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─── Events Table ─────────────────────────────────────────────────────────────
export const events = pgTable('events', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category').notNull(), // 'wedding' | 'college_fest' | 'milestone_birthday'
  date: text('date').notNull(),
  city: text('city').notNull(),
  invitedCount: integer('invited_count').notNull().default(0),
  confirmedRsvpCount: integer('confirmed_rsvp_count').notNull().default(0),
  totalBudget: integer('total_budget').notNull().default(0),
  contingencyReservePercent: integer('contingency_reserve_percent').notNull().default(10),
  activeWhatsappGroupsReplaced: integer('active_whatsapp_groups_replaced').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Budget & Vendor Contracts Table ──────────────────────────────────────────
export const budgetItems = pgTable(
  'budget_items',
  {
    id: text('id').primaryKey(),
    eventId: text('event_id').notNull(),
    category: text('category').notNull(),
    vendorName: text('vendor_name').notNull(),
    quotedAmount: integer('quoted_amount').notNull().default(0),
    committedInstalments: integer('committed_instalments').notNull().default(0),
    projectedFinalInvoice: integer('projected_final_invoice').notNull().default(0),
    overrunRiskReason: text('overrun_risk_reason').default(''),
    quoteChallengeTip: text('quote_challenge_tip').default(''),
    backupVendorName: text('backup_vendor_name').default(''),
    backupVendorDelta: integer('backup_vendor_delta').default(0),
    confirmationStatus: text('confirmation_status').notNull().default('pending_ping'), // 'confirmed_24h' | 'pending_ping' | 'at_risk'
    vendorPhone: text('vendor_phone').default(''),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('budget_items_event_idx').on(table.eventId),
  ]
);

// ─── Plan Suggestions & Co-Planner Items ──────────────────────────────────────
export const planSuggestions = pgTable(
  'plan_suggestions',
  {
    id: text('id').primaryKey(),
    eventId: text('event_id').notNull(),
    phase: text('phase').notNull(),
    title: text('title').notNull(),
    estimatedCost: integer('estimated_cost').notNull().default(0),
    costRationale: text('cost_rationale').default(''),
    wasteImpact: text('waste_impact').default(''),
    accessibilityNote: text('accessibility_note').default(''),
    status: text('status').notNull().default('pending'), // 'pending' | 'approved' | 'rejected'
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('plan_suggestions_event_idx').on(table.eventId),
  ]
);

// ─── RSVP & Guest Register Table ──────────────────────────────────────────────
export const rsvpGuests = pgTable(
  'rsvp_guests',
  {
    id: text('id').primaryKey(),
    eventId: text('event_id').notNull(),
    name: text('name').notNull(),
    phone: text('phone').notNull(),
    dietary: text('dietary').notNull().default('standard'), // 'standard' | 'jain' | 'vegan' | 'nut_free'
    accessibilityTags: json('accessibility_tags').$type<string[]>().default([]),
    rsvpStatus: text('rsvp_status').notNull().default('confirmed'), // 'confirmed' | 'pending' | 'declined'
    plusOnes: integer('plus_ones').notNull().default(0),
    notes: text('notes').default(''),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('rsvp_guests_event_idx').on(table.eventId),
  ]
);

// ─── Run-of-Show Master Timeline Items ─────────────────────────────────────────
export const runSheetItems = pgTable(
  'run_sheet_items',
  {
    id: text('id').primaryKey(),
    eventId: text('event_id').notNull(),
    baseTime: text('base_time').notNull(),
    currentTime: text('current_time').notNull(),
    durationMins: integer('duration_mins').notNull().default(0),
    delayMins: integer('delay_mins').notNull().default(0),
    title: text('title').notNull(),
    owner: text('owner').notNull(),
    vendorPhone: text('vendor_phone').default(''),
    dependencyNote: text('dependency_note').default(''),
    status: text('status').notNull().default('upcoming'), // 'completed' | 'live' | 'upcoming' | 'delayed'
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('run_sheet_items_event_idx').on(table.eventId),
  ]
);

// ─── Stakeholder Collaborative Consensus Votes ────────────────────────────────
export const stakeholderVotes = pgTable(
  'stakeholder_votes',
  {
    id: text('id').primaryKey(),
    eventId: text('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    suggestionId: text('suggestion_id')
      .notNull()
      .references(() => planSuggestions.id, { onDelete: 'cascade' }),
    stakeholderRole: text('stakeholder_role').notNull(), // 'parents' | 'couple' | 'logistics'
    vote: text('vote').notNull(), // 'approved' | 'review' | 'loved' | 'neutral' | 'feasible' | 'risk'
    voterName: text('voter_name').default(''),
    votedAt: timestamp('voted_at').defaultNow().notNull(),
  },
  (table) => [
    index('stakeholder_votes_event_idx').on(table.eventId),
    index('stakeholder_votes_suggestion_idx').on(table.suggestionId),
  ]
);

// ─── AI Concierge Chat Conversation History ──────────────────────────────────
export const aiChatMessages = pgTable(
  'ai_chat_messages',
  {
    id: text('id').primaryKey(),
    eventId: text('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    sender: text('sender').notNull(), // 'user' | 'assistant'
    message: text('message').notNull(),
    contextSnapshot: json('context_snapshot').$type<Record<string, unknown>>().default({}),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('ai_chat_messages_event_idx').on(table.eventId),
  ]
);

// ─── Vendor Communication & Audit Log ─────────────────────────────────────────
export const vendorAuditLog = pgTable(
  'vendor_audit_log',
  {
    id: text('id').primaryKey(),
    eventId: text('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    budgetItemId: text('budget_item_id')
      .notNull()
      .references(() => budgetItems.id, { onDelete: 'cascade' }),
    actionType: text('action_type').notNull(), // 'whatsapp_ping_drafted' | 'status_updated' | 'quote_challenged'
    details: text('details').default(''),
    timestamp: timestamp('timestamp').defaultNow().notNull(),
  },
  (table) => [
    index('vendor_audit_log_event_idx').on(table.eventId),
  ]
);

// ─── Entity Relations ─────────────────────────────────────────────────────────
export const eventsRelations = relations(events, ({ many }) => ({
  budgetItems: many(budgetItems),
  planSuggestions: many(planSuggestions),
  rsvpGuests: many(rsvpGuests),
  runSheetItems: many(runSheetItems),
  stakeholderVotes: many(stakeholderVotes),
  aiChatMessages: many(aiChatMessages),
  vendorAuditLog: many(vendorAuditLog),
}));

export const planSuggestionsRelations = relations(planSuggestions, ({ one, many }) => ({
  event: one(events, {
    fields: [planSuggestions.eventId],
    references: [events.id],
  }),
  votes: many(stakeholderVotes),
}));

export const budgetItemsRelations = relations(budgetItems, ({ one, many }) => ({
  event: one(events, {
    fields: [budgetItems.eventId],
    references: [events.id],
  }),
  auditLogs: many(vendorAuditLog),
}));

// ─── Export Inferred Entity Types ────────────────────────────────────────────
export type EventEntity = typeof events.$inferSelect;
export type InsertEventEntity = typeof events.$inferInsert;

export type BudgetItemEntity = typeof budgetItems.$inferSelect;
export type InsertBudgetItemEntity = typeof budgetItems.$inferInsert;

export type PlanSuggestionEntity = typeof planSuggestions.$inferSelect;
export type InsertPlanSuggestionEntity = typeof planSuggestions.$inferInsert;

export type RsvpGuestEntity = typeof rsvpGuests.$inferSelect;
export type InsertRsvpGuestEntity = typeof rsvpGuests.$inferInsert;

export type RunSheetItemEntity = typeof runSheetItems.$inferSelect;
export type InsertRunSheetItemEntity = typeof runSheetItems.$inferInsert;

export type StakeholderVoteEntity = typeof stakeholderVotes.$inferSelect;
export type InsertStakeholderVoteEntity = typeof stakeholderVotes.$inferInsert;

export type AIChatMessageEntity = typeof aiChatMessages.$inferSelect;
export type InsertAIChatMessageEntity = typeof aiChatMessages.$inferInsert;

export type VendorAuditLogEntity = typeof vendorAuditLog.$inferSelect;
export type InsertVendorAuditLogEntity = typeof vendorAuditLog.$inferInsert;
