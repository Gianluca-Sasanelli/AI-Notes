import type { DataUIPart, UIMessage, UIMessagePart } from "ai"
import { z } from "zod/v4"
import type { NotesToolsType } from "@/lib/agents/tools/notes-tools"
import type { WebSearchToolsType } from "@/lib/agents/tools/web-search"
import { AIModel, USER_MODELS } from "@/lib/agents/models"
export type AgentStatusData = {
  "ai-status": {
    frontend_message: string
  }
}

export type AgentStatusUIData = DataUIPart<AgentStatusData>
export type AIData = AgentStatusData

export type AiTools = NotesToolsType & WebSearchToolsType
export type ChatUIMessage = UIMessage<null, AIData, AiTools>
export type ChatUIMessagePart = UIMessagePart<AIData, AiTools>
const VALID_MODELS = Object.keys(USER_MODELS) as [AIModel, ...AIModel[]]

export const AiFrontendTools: Record<string, { title: string; icon?: string }> = {
  listNotes: { title: "List Notes", icon: "📋" },
  getNoteFile: { title: "Read File", icon: "📄" },
  webSearch: { title: "Web Search", icon: "🌐" }
}

export type chatContext =
  | {
      topicId: string
    }
  | {
      noteIds: string[]
    }
  | null

export const chatRequestSchema = z.object({
  id: z.string().describe("Chat id"),
  messages: z.array(z.custom<ChatUIMessage>()).describe("Array of chat messages"),
  model: z.enum(VALID_MODELS).describe("AI model to use"),
  context: z
    .custom<chatContext>()
    .optional()
    .transform((v) => v ?? null)
    .describe("Chat context")
})
