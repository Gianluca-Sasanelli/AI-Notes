import { ChatUIMessage } from "@/lib/types/chat-types"
import { pgTable, integer, timestamp, jsonb, text, index } from "drizzle-orm/pg-core"

export type NoteMetadata = Record<string, string | number | boolean>

export const notes = pgTable(
  "notes",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: text().notNull(),
    timestamp: timestamp({ withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    content: text().notNull(),
    metadata: jsonb().$type<NoteMetadata>()
  },
  (table) => [index("notes_timestamp_idx").on(table.timestamp)]
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
