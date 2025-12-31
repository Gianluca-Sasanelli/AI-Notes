ALTER TABLE "notes" ALTER COLUMN "startTimestamp" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "notes" ALTER COLUMN "granularity" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "notes" ALTER COLUMN "granularity" DROP NOT NULL;