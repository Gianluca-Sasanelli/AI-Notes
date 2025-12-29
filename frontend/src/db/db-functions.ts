import { db } from "@/index"
import { notes, chats, type NoteMetadata } from "@/db/schema"
import { desc, count, eq, and, sql } from "drizzle-orm"
import type { UpdateNoteData, NoteGranularity } from "@/lib/types/database-types"
import type { ChatUIMessage } from "@/lib/types/chat-types"
import { removeDataPartsFromMessages } from "@/lib/utils"
import { generateTitle } from "@/lib/agents/title-generations"
import { ModelMessage } from "ai"

export const createNote = async (
  userId: string,
  content: string,
  startTimestamp: Date,
  metadata: NoteMetadata,
  endTimestamp?: Date,
  granularity?: NoteGranularity
) => {
  const [note] = await db
    .insert(notes)
    .values({ userId, content, startTimestamp, endTimestamp, granularity, metadata })
    .returning({ id: notes.id })
  return note.id
}

export const getNotes = async (
  userId: string,
  skip: number = 0,
  limit: number = 10,
  includeTotal: boolean = false
) => {
  const items = await db
    .select({
      id: notes.id,
      startTimestamp: notes.startTimestamp,
      endTimestamp: notes.endTimestamp,
      granularity: notes.granularity,
      createdAt: notes.createdAt,
      updatedAt: notes.updatedAt,
      content: notes.content,
      metadata: notes.metadata
    })
    .from(notes)
    .where(eq(notes.userId, userId))
    .orderBy(desc(sql`COALESCE(${notes.endTimestamp}, ${notes.startTimestamp})`))
    .limit(limit + 1)
    .offset(skip)
  const hasNext = items.length > limit
  const data = hasNext ? items.slice(0, limit) : items

  let total: number | undefined
  if (includeTotal) {
    const [result] = await db.select({ count: count() }).from(notes).where(eq(notes.userId, userId))
    total = result.count
  }

  return { data, hasNext, total }
}

export const updateNote = async (userId: string, id: number, data: UpdateNoteData) => {
  await db
    .update(notes)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(notes.id, id), eq(notes.userId, userId)))
}

export const deleteNote = async (userId: string, id: number) => {
  await db.delete(notes).where(and(eq(notes.id, id), eq(notes.userId, userId)))
}

export const createChat = async (
  userId: string,
  id: string,
  messages: ChatUIMessage[],
  serverMessages: ModelMessage[]
) => {
  await db.insert(chats).values({ id, userId, messages: removeDataPartsFromMessages(messages) })
  console.log("Generating title for chat", id)
  void generateTitle(serverMessages)
    .then((title) => db.update(chats).set({ title }).where(eq(chats.id, id)))
    .catch((error) => {
      console.error("Error generating title", error)
    })
}

export const updateChat = async (userId: string, id: string, messages: ChatUIMessage[]) => {
  await db
    .update(chats)
    .set({ messages: removeDataPartsFromMessages(messages), updatedAt: new Date() })
    .where(and(eq(chats.id, id), eq(chats.userId, userId)))
}

export const getChat = async (userId: string, id: string) => {
  const [chat] = await db
    .select({
      id: chats.id,
      messages: chats.messages,
      title: chats.title,
      createdAt: chats.createdAt,
      updatedAt: chats.updatedAt
    })
    .from(chats)
    .where(and(eq(chats.id, id), eq(chats.userId, userId)))
  return chat
}

export const getChats = async (userId: string, skip: number = 0, limit: number = 10) => {
  const items = await db
    .select({ id: chats.id, title: chats.title, updatedAt: chats.updatedAt })
    .from(chats)
    .where(eq(chats.userId, userId))
    .orderBy(desc(chats.updatedAt))
    .limit(limit + 1)
    .offset(skip)
  const hasNext = items.length > limit
  const data = hasNext ? items.slice(0, limit) : items
  return { data, hasNext }
}

export const updateChatTitle = async (userId: string, id: string, title: string) => {
  await db
    .update(chats)
    .set({ title, updatedAt: new Date() })
    .where(and(eq(chats.id, id), eq(chats.userId, userId)))
}

export const deleteChat = async (userId: string, id: string) => {
  await db.delete(chats).where(and(eq(chats.id, id), eq(chats.userId, userId)))
}
