import type { DataUIPart, UIMessage, UIMessagePart } from "ai"
import { z } from "zod/v4"
import type { NotesToolsType } from "@/lib/agents/tools/notes-tools"
export type AgentStatusData = {
  "ai-status": {
    frontend_message: string
  }
}

export type AgentStatusUIData = DataUIPart<AgentStatusData>
export type AIData = AgentStatusData

export type AiTools = NotesToolsType
export type ChatUIMessage = UIMessage<null, AIData, AiTools>
export type ChatUIMessagePart = UIMessagePart<AIData, AiTools>
export const chatRequestSchema = z.object({
  id: z.string().describe("Chat id"),
  messages: z.array(z.custom<ChatUIMessage>()).describe("Array of chat messages")
})
export const AiFrontendTools: Record<string, { title: string; icon?: string }> = {
  listNotes: { title: "List Notes", icon: "📋" }
}
