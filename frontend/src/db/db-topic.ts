import { db } from "@/index"
import { topics } from "@/db/schema"
import { logger, withTiming } from "@/lib/logger"
import { and, desc, eq, like } from "drizzle-orm"
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
export const getTopicById = async (userId: string, id: number) => {
  logger.debug("db", "Fetching topic by id", { userId, id })
  return withTiming("db", "getTopicById", async () => {
    const [topic] = await db
      .select({
        name: topics.name
      })
      .from(topics)
      .where(and(eq(topics.userId, userId), eq(topics.id, id)))
    return topic ?? null
  })
}

export const getTopics = async (userId: string, skip: number = 0, limit: number = 10) => {
  logger.debug("db", "Fetching topics", { userId })
  return withTiming("db", "getTopics", async () => {
    const items = await db
      .select({
        id: topics.id,
        name: topics.name,
        color: topics.color,
        createdAt: topics.createdAt,
        updatedAt: topics.updatedAt
      })
      .from(topics)
      .where(eq(topics.userId, userId))
      .orderBy(desc(topics.updatedAt))
      .limit(limit + 1)
      .offset(skip)
    const hasNext = items.length > limit
    const data = hasNext ? items.slice(0, limit) : items
    return { data, hasNext }
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
export const searchTopics = async (userId: string, query: string) => {
  logger.debug("db", "Searching topics", { userId, query })
  return withTiming("db", "searchTopics", async () => {
    const items = await db
      .select({
        id: topics.id,
        name: topics.name,
        createdAt: topics.createdAt,
        updatedAt: topics.updatedAt
      })
      .from(topics)
      .where(and(eq(topics.userId, userId), like(topics.name, `%${query}%`)))
      .orderBy(desc(topics.updatedAt))
      .limit(11)
    const hasNext = items.length > 10
    const data = hasNext ? items.slice(0, 10) : items
    return { data, hasNext }
  })
}
