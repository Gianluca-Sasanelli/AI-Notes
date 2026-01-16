CREATE TABLE "topics" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "topics_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" text NOT NULL,
	"name" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "topicId" integer;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_topicId_topics_id_fk" FOREIGN KEY ("topicId") REFERENCES "public"."topics"("id") ON DELETE set null ON UPDATE no action;