import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { APICallError, ModelMessage } from "ai"
import { ChatUIMessage } from "./types/chat-types"
import { TopicEdit } from "@/components/ui/topic-editor"
import { TopicBody } from "@/lib/types/api-types"
import { generateTitle } from "@/lib/agents/title-generations"
import { convex } from "@/lib/convex-server"
import { api } from "@convex/_generated/api"
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
export function RemoveReasoning(messages: ModelMessage[]): ModelMessage[] {
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
  if (topic._id === null) return { new: { name: topic.name, color: topic.color } }
  if ("removed" in topic) {
    return { removed: topic._id }
  }
  return { [topic._id]: { name: topic.name, color: topic.color, modified: topic.modified } }
}

export async function createChatWithTitle(
  userId: string,
  chatId: string,
  messages: ChatUIMessage[],
  serverMessages: ModelMessage[]
) {
  await convex.mutation(api.chats.createChat, {
    userId,
    clientId: chatId,
    messages
  })
  void generateTitle(serverMessages)
    .then((title) =>
      convex.mutation(api.chats.updateChatTitle, {
        userId,
        clientId: chatId,
        title
      })
    )
    .catch((e) => console.warn("Title generation/update failed", e))
}
export default async function loadTranslations(locale: string) {
  try {
    const t = await import(`../public/_gt/${locale}.json`)
    return t.default
  } catch (error) {
    console.warn(`Failed to load translations for ${locale}:`, error)
    return {}
  }
}
