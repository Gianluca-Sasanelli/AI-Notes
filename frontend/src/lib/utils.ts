import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { APICallError } from "ai"
import { ChatUIMessage } from "./types/chat-types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function removeDataPartsFromMessages(messages: ChatUIMessage[]): ChatUIMessage[] {
  return messages.map((message) => ({
    ...message,
    parts: message.parts.filter((part) => !part.type.startsWith("data"))
  }))
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
