import { db } from "@/index"
import { notes, type NoteMetadata } from "@/db/schema"
import { desc, count, eq } from "drizzle-orm"
import type { UpdateNoteData } from "@/lib/types"

export const createNote = async (content: string, timestamp: Date, metadata: NoteMetadata) => {
  const [note] = await db
    .insert(notes)
    .values({ content, timestamp, metadata })
    .returning({ id: notes.id })
  return note.id
}

export const getNotes = async (
  skip: number = 0,
  limit: number = 10,
  includeTotal: boolean = false
) => {
  const items = await db
    .select()
    .from(notes)
    .orderBy(desc(notes.timestamp))
    .limit(limit + 1)
    .offset(skip)
  const hasNext = items.length > limit
  const data = hasNext ? items.slice(0, limit) : items

  let total: number | undefined
  if (includeTotal) {
    const [result] = await db.select({ count: count() }).from(notes)
    total = result.count
  }

  return { data, hasNext, total }
}

export const updateNote = async (id: number, data: UpdateNoteData) => {
  await db
    .update(notes)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(notes.id, id))
}
