import type { LanguageModelV3 } from "@ai-sdk/provider"
import type { ModelMessage } from "ai"
import { stepCountIs, streamText } from "ai"
import { handleAgentError } from "@/lib/utils"
import { NotesTools } from "./tools/notes-tools"
import { buildAssistantSystemPrompt } from "./system-prompts/prompts"
import { auth } from "@clerk/nextjs/server"
import { WebSearchTools } from "./tools/web-search"
import type { ProviderOptions } from "./models"
import { convex } from "@/lib/convex-server"
import { api } from "@convex/_generated/api"

export async function runAssistantAgent(
  messages: ModelMessage[],
  model: LanguageModelV3,
  providerOptions?: ProviderOptions,
  abortSignal?: AbortSignal
) {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("User not authenticated")
  }

  const timelessNotes = await convex.query(api.notes.getLatestTimelessNotes, {
    userId,
    limit: 20
  })

  const systemPrompt = buildAssistantSystemPrompt(timelessNotes)

  const tools = NotesTools(userId)
  const webSearchTools = WebSearchTools()
  return streamText({
    model,
    system: systemPrompt,
    messages,
    tools: { ...tools, ...webSearchTools },
    stopWhen: stepCountIs(10),
    providerOptions,
    abortSignal,
    onError: (error) => {
      throw handleAgentError(error, "ASSISTANT AGENT")
    }
  })
}
