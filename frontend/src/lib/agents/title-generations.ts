import type { ModelMessage } from "ai"
import { generateText } from "ai"

import { GOOGLE_MODEL, getModelInstance } from "./models"

export async function generateTitle(messages: ModelMessage[]) {
  const { text: title } = await generateText({
    model: getModelInstance(GOOGLE_MODEL.GEMINI_2_5_FLASH).model,
    messages,
    system:
      "You are a title generation agent. You are given a list of messages and you need to generate a title for the chat. Max 5 words."
  })
  console.log("Title generated", title)
  return title
}
