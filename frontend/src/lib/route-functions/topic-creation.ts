import { TopicDbData } from "../types/database-types"
import { createTopic, updateTopic } from "@/db/db-topic"
import { logger } from "@/lib/logger"


export async function handleTopicCreationOrUpdate(
  userId: string,
  topicEntry: { [id: number]: TopicDbData } | { new: TopicDbData } | undefined
) {
  console.log("In handletopicCreationOrUpdate with topicEntry:", topicEntry)
  let output: number | undefined = undefined
  if (!topicEntry) {
    return output
  }
  if ("new" in topicEntry) {
    output = await createTopic(userId, topicEntry.new)
  } else {
    for (const [id, data] of Object.entries(topicEntry)) {
      const parsedId = parseInt(id, 10)
      try {
        await updateTopic(userId, parsedId, data)
      } catch (error) {
        logger.error(
          "api",
          `Failed to update topic with id ${id}: ${error instanceof Error ? error.message : String(error)}`
        )
        throw new Error("An error occurred while processing the topic update.")
      }
      output = parsedId
    }
  }
  return output
}
