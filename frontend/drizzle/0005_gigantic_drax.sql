CREATE TABLE "user_summaries" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"notesSummary" text DEFAULT '' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
