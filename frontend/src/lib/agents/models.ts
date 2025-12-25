import type { LanguageModelV3 } from "@ai-sdk/provider"
import { google } from "@ai-sdk/google"

export enum GOOGLE_MODEL {
  GEMINI_2_5_FLASH = "gemini-2.5-flash"
}
export function getModelInstance(model: GOOGLE_MODEL): LanguageModelV3 {
  return google(model)
}
