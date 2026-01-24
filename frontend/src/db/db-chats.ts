import { db } from "@/index"
import { chats } from "@/db/schema"
import { desc, eq, and } from "drizzle-orm"
import type { ChatUIMessage } from "@/lib/types/chat-types"
import { removePartsFromMessages } from "@/lib/utils"
import { generateTitle } from "@/lib/agents/title-generations"
import { ModelMessage } from "ai"
import { logger, withTiming } from "@/lib/logger"

export const createChat = async (
  userId: string,
  id: string,
  messages: ChatUIMessage[],
  serverMessages: ModelMessage[]
) => {
  logger.info("db", "Creating chat", { chatId: id })
  let title: string | undefined = undefined
  try {
    title = await generateTitle(serverMessages)
  } catch (error) {
    logger.warn("db", "Error generating title", { chatId: id, error: String(error) })
  }
  await withTiming("db", "createChat", async () => {
    await db.insert(chats).values({
      id,
      userId,
      messages: removePartsFromMessages(messages, "data"),
      ...(title !== undefined ? { title } : {})
    })
  })
}

export const updateChat = async (userId: string, id: string, messages: ChatUIMessage[]) => {
  logger.debug("db", "Updating chat", { chatId: id, messageCount: messages.length })
  return withTiming("db", "updateChat", async () => {
    await db
      .update(chats)
      .set({ messages: removePartsFromMessages(messages, "data"), updatedAt: new Date() })
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
