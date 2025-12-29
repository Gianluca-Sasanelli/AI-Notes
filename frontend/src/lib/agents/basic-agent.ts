import type { ModelMessage } from "ai"
import { stepCountIs, streamText } from "ai"
import { handleAgentError } from "@/lib/utils"
import { GOOGLE_MODEL, getModelInstance } from "./models"
import { NotesTools } from "./tools/notes-tools"
import { auth } from "@clerk/nextjs/server"

export async function runAssistantAgent(messages: ModelMessage[]) {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("User not authenticated")
  }
  const tools = NotesTools(userId)
  return streamText({
    model: getModelInstance(GOOGLE_MODEL.GEMINI_2_5_FLASH),
    messages,
    tools,
    stopWhen: stepCountIs(5),
    onError: (error) => {
      throw handleAgentError(error, "ASSISTANT AGENT")
    }
  })
}
