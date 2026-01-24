import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { APICallError, ModelMessage } from "ai"
import { ChatUIMessage } from "./types/chat-types"
import { TopicEdit } from "@/components/ui/topic-editor"
import { TopicBody } from "@/lib/types/api-types"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function removePartsFromMessages(
  messages: ChatUIMessage[],
  partType: string
): ChatUIMessage[] {
  return messages.map((message) => ({
    ...message,
    parts: message.parts.filter((part) => !part.type.startsWith(partType))
  }))
}
export function RemoteReasoning(messages: ModelMessage[]): ModelMessage[] {
  return messages.map((message) => {
    if (message.role !== "assistant") return message
    if (typeof message.content === "string") return message
    return {
      ...message,
      content: message.content.filter((part) => part.type !== "reasoning")
    }
  })
}
export function handleAgentError(error: { error: unknown }, agentName: string): Error {
  if (APICallError.isInstance(error.error)) {
    console.error(`[${agentName}]`, error.error)
    return new Error(
      "There was an API connection error with the base provider. Please try again or contact support."
    )
  }
  console.error(`[${agentName}] Unknown error type:`, error)
  return new Error("An unexpected error occurred. Please try again or contact support.")
}
export function transformTopicEditToTopicBody(topic: TopicEdit | undefined | null): TopicBody {
  if (!topic) return undefined
  if (topic.id === null) return { new: { name: topic.name, color: topic.color } }
  if ("removed" in topic) {
    return { removed: topic.id }
  }
  return { [topic.id]: { name: topic.name, color: topic.color, modified: topic.modified } }
}
