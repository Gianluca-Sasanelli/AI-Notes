import { db } from "@/index"
import { notes, type NoteMetadata, topics } from "@/db/schema"
import { desc, count, eq, and, gt, gte, lte, sql } from "drizzle-orm"
import type { UpdateNoteData, NoteGranularity, TimeNoteSummary } from "@/lib/types/database-types"
import { logger, withTiming } from "@/lib/logger"

export const createNote = async (
  userId: string,
  content: string,
  metadata: NoteMetadata,
  startTimestamp?: Date | null,
  endTimestamp?: Date | null,
  granularity?: NoteGranularity | null,
  topicId?: number | null
) => {
  logger.info("db", "Creating note", { userId, granularity })
  return withTiming("db", "createNote", async () => {
    const [note] = await db
      .insert(notes)
      .values({ userId, content, startTimestamp, endTimestamp, granularity, metadata, topicId })
      .returning({ id: notes.id })
    logger.info("db", "Note created", { noteId: note.id })
    return note.id
  })
}

export const getTimeNotes = async (
  userId: string,
  skip: number = 0,
  limit: number = 10,
  includeTotal: boolean = false,
  topicId: number | undefined = undefined
) => {
  logger.debug("db", "Fetching time notes", { userId, skip, limit, includeTotal })
  return withTiming("db", "getTimeNotes", async () => {
    const items = await db
      .select({
        id: notes.id,
        startTimestamp: notes.startTimestamp,
        endTimestamp: notes.endTimestamp,
        granularity: notes.granularity,
        createdAt: notes.createdAt,
        updatedAt: notes.updatedAt,
        content: notes.content,
        metadata: notes.metadata,
        files: notes.files,
        topic: {
          id: topics.id,
          name: topics.name,
          color: topics.color
        }
      })
      .from(notes)
      .leftJoin(topics, eq(notes.topicId, topics.id))
      .where(
        and(
          eq(notes.userId, userId),
          sql`${notes.startTimestamp} IS NOT NULL`,
          topicId === undefined ? sql`true` : eq(notes.topicId, topicId)
        )
      )
      .orderBy(desc(sql`COALESCE(${notes.endTimestamp}, ${notes.startTimestamp})`))
      .limit(limit + 1)
      .offset(skip)
    const hasNext = items.length > limit
    const data = hasNext ? items.slice(0, limit) : items

    let total: number | undefined
    if (includeTotal) {
      const [result] = await db
        .select({ count: count() })
        .from(notes)
        .where(and(eq(notes.userId, userId), sql`${notes.startTimestamp} IS NOT NULL`))
      total = result.count
    }

    logger.debug("db", "Time notes fetched", { count: data.length, hasNext })
    return { data, hasNext, total }
  })
}

export const getTimelessNotes = async (
  userId: string,
  skip: number = 0,
  limit: number = 10,
  includeTotal: boolean = false
) => {
  logger.debug("db", "Fetching timeless notes", { userId, skip, limit, includeTotal })
  return withTiming("db", "getTimelessNotes", async () => {
    const items = await db
      .select({
        id: notes.id,
        startTimestamp: notes.startTimestamp,
        endTimestamp: notes.endTimestamp,
        granularity: notes.granularity,
        createdAt: notes.createdAt,
        updatedAt: notes.updatedAt,
        content: notes.content,
        metadata: notes.metadata,
        files: notes.files
      })
      .from(notes)
      .where(and(eq(notes.userId, userId), sql`${notes.startTimestamp} IS NULL`))
      .orderBy(desc(notes.createdAt))
      .limit(limit + 1)
      .offset(skip)
    const hasNext = items.length > limit
    const data = hasNext ? items.slice(0, limit) : items

    let total: number | undefined
    if (includeTotal) {
      const [result] = await db
        .select({ count: count() })
        .from(notes)
        .where(and(eq(notes.userId, userId), sql`${notes.startTimestamp} IS NULL`))
      total = result.count
    }

    logger.debug("db", "Timeless notes fetched", { count: data.length, hasNext })
    return { data, hasNext, total }
  })
}

export const getNote = async (userId: string, id: number) => {
  logger.debug("db", "Fetching note", { noteId: id })
  return withTiming("db", "getNote", async () => {
    const [note] = await db
      .select({
        id: notes.id,
        startTimestamp: notes.startTimestamp,
        endTimestamp: notes.endTimestamp,
        granularity: notes.granularity,
        createdAt: notes.createdAt,
        updatedAt: notes.updatedAt,
        content: notes.content,
        metadata: notes.metadata,
        files: notes.files
      })
      .from(notes)
      .where(and(eq(notes.id, id), eq(notes.userId, userId)))
    return note ?? null
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

export const getLatestTimelessNotes = async (userId: string, limit: number = 20) => {
  logger.debug("db", "Fetching latest timeless notes", { userId, limit })
  return withTiming("db", "getLatestTimelessNotes", async () => {
    return db
      .select({
        id: notes.id,
        content: notes.content
      })
      .from(notes)
      .where(and(eq(notes.userId, userId), sql`${notes.startTimestamp} IS NULL`))
      .orderBy(desc(notes.createdAt))
      .limit(limit)
  })
}

export const addFileToNote = async (userId: string, noteId: number, filename: string) => {
  logger.debug("db", "Adding file to note", { noteId, filename })
  return withTiming("db", "addFileToNote", async () => {
    await db
      .update(notes)
      .set({
        files: sql`array_append(${notes.files}, ${filename})`,
        updatedAt: new Date()
      })
      .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
  })
}

export const removeFileFromNote = async (userId: string, noteId: number, filename: string) => {
  logger.debug("db", "Removing file from note", { noteId, filename })
  return withTiming("db", "removeFileFromNote", async () => {
    await db
      .update(notes)
      .set({
        files: sql`array_remove(${notes.files}, ${filename})`,
        updatedAt: new Date()
      })
      .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
  })
}

export const getNoteFiles = async (userId: string, noteId: number) => {
  logger.debug("db", "Getting note files", { noteId })
  return withTiming("db", "getNoteFiles", async () => {
    const [result] = await db
      .select({ files: notes.files })
      .from(notes)
      .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    return result?.files ?? []
  })
}

export const getTimeNotesByDateRange = async (
  userId: string,
  from: Date,
  to: Date
): Promise<TimeNoteSummary[]> => {
  logger.debug("db", "Fetching notes by date range", { userId, from, to })
  return withTiming("db", "getTimeNotesByDateRange", async () => {
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
          sql`${notes.startTimestamp} IS NOT NULL`,
          gte(notes.startTimestamp, from),
          lte(notes.startTimestamp, to)
        )
      )
      .orderBy(desc(notes.startTimestamp))
    return result as TimeNoteSummary[]
  })
}
export const getNotesByTopicId = async (userId: string, topicId: number) => {
  logger.debug("db", "Fetching notes by topic id", { userId, topicId })
  return withTiming("db", "getNotesByTopicId", async () => {
    const result = await db
      .select({
        id: notes.id,
        content: notes.content,
        startTimestamp: notes.startTimestamp,
        endTimestamp: notes.endTimestamp
      })
      .from(notes)
      .where(and(eq(notes.userId, userId), eq(notes.topicId, topicId)))
      .orderBy(desc(notes.startTimestamp))
    return result as TimeNoteSummary[]
  })
}
