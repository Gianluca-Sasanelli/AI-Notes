CREATE TABLE "chats" (
	"id" text PRIMARY KEY NOT NULL,
	"messages" jsonb NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notes" ALTER COLUMN "createdAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "notes" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "notes" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "notes" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "timestamp" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE INDEX "chats_updatedAt_idx" ON "chats" USING btree ("updatedAt");--> statement-breakpoint
CREATE INDEX "notes_timestamp_idx" ON "notes" USING btree ("timestamp");