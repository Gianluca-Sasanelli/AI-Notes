import { ChatUIMessage } from "@/lib/types/chat-types"
import {
  pgTable,
  pgEnum,
  integer,
  timestamp,
  jsonb,
  text,
  index,
  varchar,
  unique
} from "drizzle-orm/pg-core"

export const granularityEnum = pgEnum("granularity", ["hour", "day", "month"])

export type NoteMetadata = Record<string, string | number | boolean>

export const topics = pgTable(
  "topics",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: text().notNull(),
    name: text().notNull(),
    color: varchar({ length: 7 }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow()
  },
  (table) => [unique().on(table.userId, table.name)]
)

// When start timestamp is null the granularity is null. The note is considered timeless in the frontend types.
export const notes = pgTable(
  "notes",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: text().notNull(),
    topicId: integer().references(() => topics.id, { onDelete: "set null" }),
    startTimestamp: timestamp({ withTimezone: true }),
    endTimestamp: timestamp({ withTimezone: true }),
    granularity: granularityEnum(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    content: text().notNull(),
    metadata: jsonb().$type<NoteMetadata>(),
    files: varchar({ length: 255 }).array().notNull().default([])
  },
  (table) => [index("notes_start_timestamp_idx").on(table.startTimestamp)]
)

export const chats = pgTable(
  "chats",
  {
    id: text().primaryKey(),
    userId: text().notNull(),
    messages: jsonb().$type<ChatUIMessage[]>().notNull(),
    title: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow()
  },
  (table) => [index("chats_updatedAt_idx").on(table.updatedAt)]
)

export const userSummaries = pgTable("user_summaries", {
  userId: text().primaryKey(),
  notesSummary: text().notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow()
})
