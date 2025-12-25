import type { ModelMessage } from "ai"
import { stepCountIs, streamText } from "ai"

import { handleAgentError } from "@/lib/utils"
import { GOOGLE_MODEL, getModelInstance } from "./models"

export async function runAssistantAgent(messages: ModelMessage[]) {
  return streamText({
    model: getModelInstance(GOOGLE_MODEL.GEMINI_2_5_FLASH),
    messages,
    stopWhen: stepCountIs(5),
    onError: (error) => {
      throw handleAgentError(error, "ASSISTANT AGENT")
    }
  })
}
