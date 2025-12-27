import type { DataUIPart, UIMessage, UIMessagePart, UITools } from "ai"
import { z } from "zod/v4"

export type AgentStatusData = {
  "ai-status": {
    frontend_message: string
  }
}

export type AgentStatusUIData = DataUIPart<AgentStatusData>
export type AIData = AgentStatusData
export type ChatUIMessage = UIMessage<null, AIData>
export type ChatUIMessagePart = UIMessagePart<AIData, UITools>

export const chatRequestSchema = z.object({
  id: z.string().describe("Chat id"),
  messages: z.array(z.custom<ChatUIMessage>()).describe("Array of chat messages")
})
