import { db } from "@/index"
import { topics } from "@/db/schema"
import { logger, withTiming } from "@/lib/logger"
import { and, desc, eq } from "drizzle-orm"
import { TopicDbData } from "@/lib/types/database-types"

export const createTopic = async (userId: string, data: TopicDbData) => {
  logger.info("db", "Creating topic", { userId, data })
  return withTiming("db", "createTopic", async () => {
    const [topic] = await db
      .insert(topics)
      .values({
        userId,
        ...data
      })
      .returning({ id: topics.id })
    return topic.id
  })
}

export const getTopics = async (userId: string) => {
  logger.debug("db", "Fetching topics", { userId })
  return withTiming("db", "getTopics", async () => {
    const items = await db
      .select()
      .from(topics)
      .where(eq(topics.userId, userId))
      .orderBy(desc(topics.updatedAt))
    return items
  })
}
export const getTopic = async (userId: string, id: number) => {
  logger.debug("db", "Fetching topic", { userId, id })
  return withTiming("db", "getTopic", async () => {
    const item = await db
      .select()
      .from(topics)
      .where(and(eq(topics.userId, userId), eq(topics.id, id)))
    return item
  })
}
export const deleteTopic = async (userId: string, id: number) => {
  logger.debug("db", "Deleting topic", { userId, id })
  return withTiming("db", "deleteTopic", async () => {
    await db.delete(topics).where(and(eq(topics.userId, userId), eq(topics.id, id)))
  })
}
export const updateTopic = async (userId: string, id: number, data: TopicDbData) => {
  logger.debug("db", "Updating topic", { userId, id, data })
  return withTiming("db", "updateTopic", async () => {
    await db
      .update(topics)
      .set(data)
      .where(and(eq(topics.userId, userId), eq(topics.id, id)))
  })
}
