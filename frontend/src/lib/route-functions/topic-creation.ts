import { TopicBody } from "../types/api-types"
import { convex } from "@/lib/convex-server"
import { api } from "@convex/_generated/api"
import { Id } from "@convex/_generated/dataModel"
import { logger } from "@/lib/logger"

export async function handleTopicCreationOrUpdateOrRemoval(
  userId: string,
  topicEntry: TopicBody
): Promise<string | undefined | null> {
  if (!topicEntry) return undefined

  if ("new" in topicEntry) {
    const id = await convex.mutation(api.topics.createTopic, {
      userId,
      name: topicEntry.new.name,
      color: topicEntry.new.color ?? undefined
    })
    return id as string
  }

  if ("removed" in topicEntry) {
    return null
  }

  let output: string | undefined = undefined
  for (const [id, data] of Object.entries(topicEntry)) {
    try {
      await convex.mutation(api.topics.updateTopic, {
        userId,
        id: id as Id<"topics">,
        name: data.name,
        color: data.color ?? undefined
      })
      output = id
    } catch (error) {
      logger.error(
        "api",
        `Failed to update topic with id ${id}: ${error instanceof Error ? error.message : String(error)}`
      )
      throw new Error("An error occurred while processing the topic update.")
    }
  }
  return output
}
