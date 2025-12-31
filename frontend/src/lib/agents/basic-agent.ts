import type { ModelMessage } from "ai"
import { stepCountIs, streamText } from "ai"
import { handleAgentError } from "@/lib/utils"
import { GOOGLE_MODEL, getModelInstance } from "./models"
import { NotesTools } from "./tools/notes-tools"
import { buildAssistantSystemPrompt } from "./system-prompts/prompts"
import { getUserSummary, getLatestTimelessNotes } from "@/db/db-functions"
import { auth } from "@clerk/nextjs/server"

export async function runAssistantAgent(messages: ModelMessage[]) {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("User not authenticated")
  }

  const [summary, timelessNotes] = await Promise.all([
    getUserSummary(userId),
    getLatestTimelessNotes(userId, 20)
  ])

  const systemPrompt = buildAssistantSystemPrompt(summary?.notesSummary ?? null, timelessNotes)

  const tools = NotesTools(userId)
  return streamText({
    model: getModelInstance(GOOGLE_MODEL.GEMINI_2_5_FLASH),
    system: systemPrompt,
    messages,
    tools,
    stopWhen: stepCountIs(5),
    onError: (error) => {
      throw handleAgentError(error, "ASSISTANT AGENT")
    }
  })
}
