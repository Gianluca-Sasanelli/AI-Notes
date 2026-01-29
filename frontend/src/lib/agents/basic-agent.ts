import type { LanguageModelV3 } from "@ai-sdk/provider"
import type { ModelMessage } from "ai"
import { stepCountIs, streamText } from "ai"
import { handleAgentError } from "@/lib/utils"
import { NotesTools } from "./tools/notes-tools"
import { buildAssistantSystemPrompt } from "./system-prompts/prompts"
import { getUserSummary, getLatestTimelessNotes } from "@/db"
import { auth } from "@clerk/nextjs/server"
import { WebSearchTools } from "./tools/web-search"
import type { ProviderOptions } from "./models"

export async function runAssistantAgent(
  messages: ModelMessage[],
  model: LanguageModelV3,
  context?: string,
  providerOptions?: ProviderOptions
) {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("User not authenticated")
  }

  const [summary, timelessNotes] = await Promise.all([
    getUserSummary(userId),
    getLatestTimelessNotes(userId, 20)
  ])

  const systemPrompt = buildAssistantSystemPrompt(
    summary?.notesSummary ?? null,
    timelessNotes,
    context
  )

  const tools = NotesTools(userId)
  const webSearchTools = WebSearchTools()
  return streamText({
    model,
    system: systemPrompt,
    messages,
    tools: { ...tools, ...webSearchTools },
    stopWhen: stepCountIs(10),
    providerOptions,
    onError: (error) => {
      throw handleAgentError(error, "ASSISTANT AGENT")
    }
  })
}
