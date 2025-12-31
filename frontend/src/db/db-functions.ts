import { db } from "@/index"
import { notes, chats, userSummaries, type NoteMetadata } from "@/db/schema"
import { desc, count, eq, and, gt, sql } from "drizzle-orm"
import type { UpdateNoteData, NoteGranularity, TimeNoteSummary } from "@/lib/types/database-types"
import type { ChatUIMessage } from "@/lib/types/chat-types"
import { removeDataPartsFromMessages } from "@/lib/utils"
import { generateTitle } from "@/lib/agents/title-generations"
import { ModelMessage } from "ai"
import { logger, withTiming } from "@/lib/logger"

export const createNote = async (
  userId: string,
  content: string,
  metadata: NoteMetadata,
  startTimestamp?: Date | null,
  endTimestamp?: Date | null,
  granularity?: NoteGranularity | null
) => {
  logger.info("db", "Creating note", { userId, granularity })
  return withTiming("db", "createNote", async () => {
    const [note] = await db
      .insert(notes)
      .values({ userId, content, startTimestamp, endTimestamp, granularity, metadata })
      .returning({ id: notes.id })
    logger.info("db", "Note created", { noteId: note.id })
    return note.id
  })
}

export const getNotes = async (
  userId: string,
  skip: number = 0,
  limit: number = 10,
  includeTotal: boolean = false,
  timeless: boolean = false
) => {
  logger.debug("db", "Fetching notes", { userId, skip, limit, includeTotal, timeless })
  return withTiming("db", "getNotes", async () => {
    const timelessCondition = timeless
      ? sql`${notes.startTimestamp} IS NULL`
      : sql`${notes.startTimestamp} IS NOT NULL`
    const orderBy = timeless
      ? desc(notes.createdAt)
      : desc(sql`COALESCE(${notes.endTimestamp}, ${notes.startTimestamp})`)

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
      .where(and(eq(notes.userId, userId), timelessCondition))
      .orderBy(orderBy)
      .limit(limit + 1)
      .offset(skip)
    const hasNext = items.length > limit
    const data = hasNext ? items.slice(0, limit) : items

    let total: number | undefined
    if (includeTotal) {
      const [result] = await db
        .select({ count: count() })
        .from(notes)
        .where(and(eq(notes.userId, userId), timelessCondition))
      total = result.count
    }

    logger.debug("db", "Notes fetched", { count: data.length, hasNext })
    return { data, hasNext, total }
  })
}

export const updateNote = async (userId: string, id: number, data: UpdateNoteData) => {
  logger.debug("db", "Updating note", { noteId: id })
  return withTiming("db", "updateNote", async () => {
    await db
      .update(notes)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(notes.id, id), eq(notes.userId, userId)))
  })
}

export const deleteNote = async (userId: string, id: number) => {
  logger.debug("db", "Deleting note", { noteId: id })
  return withTiming("db", "deleteNote", async () => {
    await db.delete(notes).where(and(eq(notes.id, id), eq(notes.userId, userId)))
  })
}

export const createChat = async (
  userId: string,
  id: string,
  messages: ChatUIMessage[],
  serverMessages: ModelMessage[]
) => {
  logger.info("db", "Creating chat", { chatId: id })
  await withTiming("db", "createChat", async () => {
    await db.insert(chats).values({ id, userId, messages: removeDataPartsFromMessages(messages) })
  })
  logger.debug("db", "Generating title for chat", { chatId: id })
  void generateTitle(serverMessages)
    .then((title) => db.update(chats).set({ title }).where(eq(chats.id, id)))
    .catch((error) => {
      logger.error("db", "Error generating title", { chatId: id, error: String(error) })
    })
}

export const updateChat = async (userId: string, id: string, messages: ChatUIMessage[]) => {
  logger.debug("db", "Updating chat", { chatId: id, messageCount: messages.length })
  return withTiming("db", "updateChat", async () => {
    await db
      .update(chats)
      .set({ messages: removeDataPartsFromMessages(messages), updatedAt: new Date() })
      .where(and(eq(chats.id, id), eq(chats.userId, userId)))
  })
}

export const getChat = async (userId: string, id: string) => {
  logger.debug("db", "Fetching chat", { chatId: id })
  return withTiming("db", "getChat", async () => {
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
  })
}

export const getChats = async (userId: string, skip: number = 0, limit: number = 10) => {
  logger.debug("db", "Fetching chats", { skip, limit })
  return withTiming("db", "getChats", async () => {
    const items = await db
      .select({ id: chats.id, title: chats.title, updatedAt: chats.updatedAt })
      .from(chats)
      .where(eq(chats.userId, userId))
      .orderBy(desc(chats.updatedAt))
      .limit(limit + 1)
      .offset(skip)
    const hasNext = items.length > limit
    const data = hasNext ? items.slice(0, limit) : items
    logger.debug("db", "Chats fetched", { count: data.length, hasNext })
    return { data, hasNext }
  })
}

export const updateChatTitle = async (userId: string, id: string, title: string) => {
  logger.debug("db", "Updating chat title", { chatId: id })
  return withTiming("db", "updateChatTitle", async () => {
    await db
      .update(chats)
      .set({ title, updatedAt: new Date() })
      .where(and(eq(chats.id, id), eq(chats.userId, userId)))
  })
}

export const deleteChat = async (userId: string, id: string) => {
  logger.debug("db", "Deleting chat", { chatId: id })
  return withTiming("db", "deleteChat", async () => {
    await db.delete(chats).where(and(eq(chats.id, id), eq(chats.userId, userId)))
  })
}

export const getUserSummary = async (userId: string) => {
  logger.debug("db", "Fetching user summary", { userId })
  return withTiming("db", "getUserSummary", async () => {
    const [summary] = await db.select().from(userSummaries).where(eq(userSummaries.userId, userId))
    return summary ?? null
  })
}

export const upsertUserSummary = async (userId: string, notesSummary: string) => {
  logger.debug("db", "Upserting user summary", { userId })
  return withTiming("db", "upsertUserSummary", async () => {
    await db
      .insert(userSummaries)
      .values({ userId, notesSummary })
      .onConflictDoUpdate({
        target: userSummaries.userId,
        set: { notesSummary, updatedAt: new Date() }
      })
  })
}

export const getNotesAfterDate = async (
  userId: string,
  afterDate: Date,
  limit: number = 10
): Promise<TimeNoteSummary[]> => {
  logger.debug("db", "Fetching notes after date", { userId, afterDate, limit })
  return withTiming("db", "getNotesAfterDate", async () => {
    const result = await db
      .select({
        id: notes.id,
        content: notes.content,
        startTimestamp: notes.startTimestamp,
        endTimestamp: notes.endTimestamp,
        updatedAt: notes.updatedAt
      })
      .from(notes)
      .where(
        and(
          eq(notes.userId, userId),
          gt(notes.updatedAt, afterDate),
          sql`${notes.startTimestamp} IS NOT NULL`
        )
      )
      .orderBy(desc(sql`COALESCE(${notes.endTimestamp}, ${notes.startTimestamp})`))
      .limit(limit)
    return result as TimeNoteSummary[]
  })
}

export const getLatestNotes = async (
  userId: string,
  limit: number = 10
): Promise<TimeNoteSummary[]> => {
  logger.debug("db", "Fetching latest notes", { userId, limit })
  return withTiming("db", "getLatestNotes", async () => {
    const result = await db
      .select({
        id: notes.id,
        content: notes.content,
        startTimestamp: notes.startTimestamp,
        endTimestamp: notes.endTimestamp,
        updatedAt: notes.updatedAt
      })
      .from(notes)
      .where(and(eq(notes.userId, userId), sql`${notes.startTimestamp} IS NOT NULL`))
      .orderBy(desc(sql`COALESCE(${notes.endTimestamp}, ${notes.startTimestamp})`))
      .limit(limit)
    return result as TimeNoteSummary[]
  })
}
