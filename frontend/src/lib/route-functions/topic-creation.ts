import { TopicDbData } from "../types/database-types"
import { createTopic, updateTopic } from "@/db/db-topic"
import { logger } from "@/lib/logger"

export async function handleTopicCreationOrUpdate(
  userId: string,
  topicEntry: { [id: number]: TopicDbData } | { new: TopicDbData } | undefined
) {
  let output: number | undefined = undefined
  if (!topicEntry) {
    return output
  }
  if ("new" in topicEntry) {
    output = await createTopic(userId, topicEntry.new)
  } else {
    for (const [id, data] of Object.entries(topicEntry)) {
      try {
        await updateTopic(userId, parseInt(id, 10), data)
      } catch (error) {
        logger.error(
          "api",
          `Failed to update topic with id ${id}: ${error instanceof Error ? error.message : String(error)}`
        )
        throw new Error("An error occurred while processing the topic update.")
      }
    }
  }
  return output
}
