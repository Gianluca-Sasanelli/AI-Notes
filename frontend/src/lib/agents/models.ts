import type { LanguageModelV3 } from "@ai-sdk/provider"
import type { GoogleGenerativeAIProviderOptions } from "@ai-sdk/google"
import { google } from "@ai-sdk/google"
import { groq } from "@ai-sdk/groq"
export enum GOOGLE_MODEL {
  GEMINI_2_5_FLASH = "gemini-2.5-flash"
}

export enum GROQ_MODEL {
  GPT_OSS_120B = "openai/gpt-oss-120b",
  GPT_OSS_20B = "openai/gpt-oss-20b"
}
export type AIModel = GOOGLE_MODEL | GROQ_MODEL

const MODELS_WITHOUT_REASONING: AIModel[] = []

export const hasReasoning = (model: AIModel) => !MODELS_WITHOUT_REASONING.includes(model)

export const isGroqModel = (model: AIModel): model is GROQ_MODEL => {
  return Object.values(GROQ_MODEL).includes(model as GROQ_MODEL)
}
export const isGoogleModel = (model: AIModel): model is GOOGLE_MODEL => {
  return Object.values(GOOGLE_MODEL).includes(model as GOOGLE_MODEL)
}

const googleProviderOptions: GoogleGenerativeAIProviderOptions = {
  thinkingConfig: {
    thinkingBudget: 8192,
    includeThoughts: true
  }
}

export type ProviderOptions = { google: GoogleGenerativeAIProviderOptions } | undefined

export function getModelInstance(model: AIModel): {
  model: LanguageModelV3
  hasReasoning: boolean
  providerOptions: ProviderOptions
} {
  console.log(`The model is ${model}`)
  if (isGoogleModel(model)) {
    return {
      model: google(model),
      hasReasoning: hasReasoning(model),
      providerOptions: { google: googleProviderOptions }
    }
  }
  if (isGroqModel(model)) {
    return { model: groq(model), hasReasoning: hasReasoning(model), providerOptions: undefined }
  }
  console.error(`The error in getmodelinstance is ${model}`)
  throw new Error(`Model ${model} not supported`)
}

export const USER_MODELS: Record<AIModel, string> = {
  [GOOGLE_MODEL.GEMINI_2_5_FLASH]: "Gemini Flash",
  [GROQ_MODEL.GPT_OSS_120B]: "GPT OSS 120B",
  [GROQ_MODEL.GPT_OSS_20B]: "GPT OSS 20B"
}

interface ModelCapabilities {
  supportsFiles: boolean
}

const MODEL_CAPABILITIES: Record<AIModel, ModelCapabilities> = {
  [GOOGLE_MODEL.GEMINI_2_5_FLASH]: { supportsFiles: true },
  [GROQ_MODEL.GPT_OSS_120B]: { supportsFiles: false },
  [GROQ_MODEL.GPT_OSS_20B]: { supportsFiles: false }
}

export const supportsFiles = (model: AIModel) => MODEL_CAPABILITIES[model]?.supportsFiles ?? false
