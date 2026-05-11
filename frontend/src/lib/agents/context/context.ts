import { chatContext } from "@/lib/types/chat-types"
import { logger } from "@/lib/logger"
import { convex } from "@/lib/convex-server"
import { api } from "@convex/_generated/api"
import { Id } from "@convex/_generated/dataModel"

type FormattableNote = {
  id: string
  content: string
  startTimestamp?: number
  endTimestamp?: number
}

export default async function RetrieveContext(
  chatcontext: chatContext,
  userId: string
): Promise<string | undefined> {
  if (chatcontext === null) {
    return undefined
  }
  if ("noteIds" in chatcontext) {
    return undefined
  }
  const topicId = chatcontext.topicId as Id<"topics">

  const [notes, topic] = await Promise.all([
    convex.query(api.notes.getNotesByTopicId, { userId, topicId }),
    convex.query(api.topics.getTopicById, { userId, id: topicId })
  ])

  if (!notes || notes.length === 0) {
    logger.error("context", "No notes found for topic", { topicId, userId })
    return undefined
  }

  const name = topic?.name ?? "Unnamed Topic"
  if (!topic) {
    logger.warn("context", "No topic found with the given ID", { topicId, userId })
  }

  return FormatMultipleNotes(
    notes.map((n) => ({
      id: n._id,
      content: n.content,
      startTimestamp: n.startTimestamp,
      endTimestamp: n.endTimestamp
    })),
    name
  )
}

export function FormatMultipleNotes(notes: FormattableNote[], topicName: string): string {
  let formatted = `Topic: ${topicName}\n`
  notes.forEach((note) => {
    const start = note.startTimestamp
      ? new Date(note.startTimestamp).toISOString().split("T")[0]
      : ""
    const end = note.endTimestamp
      ? ` → ${new Date(note.endTimestamp).toISOString().split("T")[0]}`
      : ""
    formatted += `- ["NoteId: ${note.id}"] [${start}${end}] ${note.content}\n`
  })
  logger.debug("context", "Formatted notes", { formatted })
  return formatted
}
