import { chatContext } from "@/lib/types/chat-types"
import { getNotesByTopicId } from "@/db/db-notes"
import { getTopicById } from "@/db/db-topic"
import { logger } from "@/lib/logger"
import type { TimeNoteSummary } from "@/lib/types/database-types"

export default async function RetrieveContext(
  chatcontext: chatContext,
  userId: string
): Promise<string | undefined> {
  if (chatcontext === null) {
    return undefined
  }
  if ("noteIds" in chatcontext) {
    // Not implemented
    return undefined
  }
  const topicId = parseInt(chatcontext.topicId, 10)
  if (isNaN(topicId)) {
    throw new Error("Error parsing the topic Id, please try again.")
  }
  let [notes, { name }] = await Promise.all([
    getNotesByTopicId(userId, topicId),
    getTopicById(userId, topicId)
  ])
  if (!notes || notes.length === 0) {
    logger.error("context", "No notes found for topic", { topicId, userId })
    return undefined
  }
  if (!name) {
    logger.warn("context", "No topic found with the given ID", { topicId, userId })
    name = "Unnamed Topic"
  }

  const LLMContext = FormatMultipleNotes(notes, name)
  return LLMContext
}

export function FormatMultipleNotes(notes: TimeNoteSummary[], topicName: string): string {
  let formatted = `Topic: ${topicName}\n`
  notes.forEach((note) => {
    const start = note.startTimestamp.toISOString().split("T")[0]
    const end = note.endTimestamp ? ` → ${note.endTimestamp.toISOString().split("T")[0]}` : ""
    formatted += `- ["NoteId: ${note.id}"] [${start}${end}] ${note.content}\n`
  })
  logger.debug("context", "Formatted notes", { formatted })
  return formatted
}
