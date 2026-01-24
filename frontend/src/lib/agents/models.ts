import type { LanguageModelV3 } from "@ai-sdk/provider"
import { google } from "@ai-sdk/google"
import { groq } from "@ai-sdk/groq"
export enum GOOGLE_MODEL {
  GEMINI_2_5_FLASH = "gemini-2.5-flash"
}

export enum GROQ_MODEL {
  GPT_OSS_120B = "openai/gpt-oss-120b",
  GPT_OSS_20B = "openai/gpt-oss-20b",
  KIMI_K2 = "moonshotai/kimi-k2-instruct-0905"
}
export type AIModel = GOOGLE_MODEL | GROQ_MODEL
export type ModelsWithoutReasoning = GROQ_MODEL.KIMI_K2
const MODELS_WITHOUT_REASONING: AIModel[] = [GROQ_MODEL.KIMI_K2]

export const hasReasoning = (model: AIModel) => !MODELS_WITHOUT_REASONING.includes(model)

export const isGroqModel = (model: AIModel): model is GROQ_MODEL => {
  return Object.values(GROQ_MODEL).includes(model as GROQ_MODEL)
}
export const isGoogleModel = (model: AIModel): model is GOOGLE_MODEL => {
  return Object.values(GOOGLE_MODEL).includes(model as GOOGLE_MODEL)
}
export function getModelInstance(model: AIModel): {
  model: LanguageModelV3
  hasReasoning: boolean
} {
  console.log(`The model is ${model}`)
  if (isGoogleModel(model)) {
    return { model: google(model), hasReasoning: hasReasoning(model) }
  }
  if (isGroqModel(model)) {
    return { model: groq(model), hasReasoning: hasReasoning(model) }
  }
  console.error(`The error in getmodelinstance is ${model}`)
  throw new Error(`Model ${model} not supported`)
}

export const USER_MODELS: Record<AIModel, string> = {
  [GOOGLE_MODEL.GEMINI_2_5_FLASH]: "Gemini Flash",
  [GROQ_MODEL.GPT_OSS_120B]: "GPT OSS 120B",
  [GROQ_MODEL.GPT_OSS_20B]: "GPT OSS 20B",
  [GROQ_MODEL.KIMI_K2]: "Kimi K2"
}
