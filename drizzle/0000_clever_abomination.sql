CREATE TABLE "ai_chat_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"sender" text NOT NULL,
	"message" text NOT NULL,
	"context_snapshot" json DEFAULT '{}'::json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "budget_items" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"category" text NOT NULL,
	"vendor_name" text NOT NULL,
	"quoted_amount" integer DEFAULT 0 NOT NULL,
	"committed_instalments" integer DEFAULT 0 NOT NULL,
	"projected_final_invoice" integer DEFAULT 0 NOT NULL,
	"overrun_risk_reason" text DEFAULT '',
	"quote_challenge_tip" text DEFAULT '',
	"backup_vendor_name" text DEFAULT '',
	"backup_vendor_delta" integer DEFAULT 0,
	"confirmation_status" text DEFAULT 'pending_ping' NOT NULL,
	"vendor_phone" text DEFAULT '',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"date" text NOT NULL,
	"city" text NOT NULL,
	"invited_count" integer DEFAULT 0 NOT NULL,
	"confirmed_rsvp_count" integer DEFAULT 0 NOT NULL,
	"total_budget" integer DEFAULT 0 NOT NULL,
	"contingency_reserve_percent" integer DEFAULT 10 NOT NULL,
	"active_whatsapp_groups_replaced" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plan_suggestions" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"phase" text NOT NULL,
	"title" text NOT NULL,
	"estimated_cost" integer DEFAULT 0 NOT NULL,
	"cost_rationale" text DEFAULT '',
	"waste_impact" text DEFAULT '',
	"accessibility_note" text DEFAULT '',
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rsvp_guests" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"dietary" text DEFAULT 'standard' NOT NULL,
	"accessibility_tags" json DEFAULT '[]'::json,
	"rsvp_status" text DEFAULT 'confirmed' NOT NULL,
	"plus_ones" integer DEFAULT 0 NOT NULL,
	"notes" text DEFAULT '',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "run_sheet_items" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"base_time" text NOT NULL,
	"current_time" text NOT NULL,
	"duration_mins" integer DEFAULT 0 NOT NULL,
	"delay_mins" integer DEFAULT 0 NOT NULL,
	"title" text NOT NULL,
	"owner" text NOT NULL,
	"vendor_phone" text DEFAULT '',
	"dependency_note" text DEFAULT '',
	"status" text DEFAULT 'upcoming' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stakeholder_votes" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"suggestion_id" text NOT NULL,
	"stakeholder_role" text NOT NULL,
	"vote" text NOT NULL,
	"voter_name" text DEFAULT '',
	"voted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendor_audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"budget_item_id" text NOT NULL,
	"action_type" text NOT NULL,
	"details" text DEFAULT '',
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_chat_messages" ADD CONSTRAINT "ai_chat_messages_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stakeholder_votes" ADD CONSTRAINT "stakeholder_votes_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stakeholder_votes" ADD CONSTRAINT "stakeholder_votes_suggestion_id_plan_suggestions_id_fk" FOREIGN KEY ("suggestion_id") REFERENCES "public"."plan_suggestions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_audit_log" ADD CONSTRAINT "vendor_audit_log_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_audit_log" ADD CONSTRAINT "vendor_audit_log_budget_item_id_budget_items_id_fk" FOREIGN KEY ("budget_item_id") REFERENCES "public"."budget_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_chat_messages_event_idx" ON "ai_chat_messages" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "budget_items_event_idx" ON "budget_items" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "plan_suggestions_event_idx" ON "plan_suggestions" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "rsvp_guests_event_idx" ON "rsvp_guests" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "run_sheet_items_event_idx" ON "run_sheet_items" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "stakeholder_votes_event_idx" ON "stakeholder_votes" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "stakeholder_votes_suggestion_idx" ON "stakeholder_votes" USING btree ("suggestion_id");--> statement-breakpoint
CREATE INDEX "vendor_audit_log_event_idx" ON "vendor_audit_log" USING btree ("event_id");