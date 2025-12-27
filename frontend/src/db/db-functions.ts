import { db } from "@/index"
import { notes, chats, type NoteMetadata } from "@/db/schema"
import { desc, count, eq } from "drizzle-orm"
import type { UpdateNoteData } from "@/lib/types/database-types"
import type { ChatUIMessage } from "@/lib/types/chat-types"
import { removeDataPartsFromMessages } from "@/lib/utils"
import { generateTitle } from "@/lib/agents/title-generations"
import { ModelMessage } from "ai"
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

export const deleteNote = async (id: number) => {
  await db.delete(notes).where(eq(notes.id, id))
}

export const createChat = async (
  id: string,
  messages: ChatUIMessage[],
  serverMessages: ModelMessage[]
) => {
  await db.insert(chats).values({ id, messages: removeDataPartsFromMessages(messages) })
  // fire and forget
  console.log("Generating title for chat", id)
  void generateTitle(serverMessages)
    .then((title) => db.update(chats).set({ title }).where(eq(chats.id, id)))
    .catch((error) => {
      console.error("Error generating title", error)
    })
}

export const updateChat = async (id: string, messages: ChatUIMessage[]) => {
  await db
    .update(chats)
    .set({ messages: removeDataPartsFromMessages(messages), updatedAt: new Date() })
    .where(eq(chats.id, id))
}

export const getChat = async (id: string) => {
  const [chat] = await db.select().from(chats).where(eq(chats.id, id))
  return chat
}

export const getChats = async (skip: number = 0, limit: number = 10) => {
  const items = await db
    .select({ id: chats.id, title: chats.title, updatedAt: chats.updatedAt })
    .from(chats)
    .orderBy(desc(chats.updatedAt))
    .limit(limit + 1)
    .offset(skip)
  const hasNext = items.length > limit
  const data = hasNext ? items.slice(0, limit) : items
  return { data, hasNext }
}
