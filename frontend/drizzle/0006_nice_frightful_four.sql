ALTER TABLE "user_summaries" DROP COLUMN "id";
ALTER TABLE "user_summaries" ADD PRIMARY KEY ("userId");--> statement-breakpoint
ALTER TABLE "user_summaries" ALTER COLUMN "notesSummary" DROP DEFAULT;--> statement-breakpoint
