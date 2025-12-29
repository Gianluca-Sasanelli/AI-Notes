CREATE TYPE "public"."granularity" AS ENUM('hour', 'day', 'month');--> statement-breakpoint
ALTER TABLE "notes" RENAME COLUMN "timestamp" TO "startTimestamp";--> statement-breakpoint
DROP INDEX "notes_timestamp_idx";--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "endTimestamp" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "granularity" "granularity" DEFAULT 'day' NOT NULL;--> statement-breakpoint
CREATE INDEX "notes_start_timestamp_idx" ON "notes" USING btree ("startTimestamp");