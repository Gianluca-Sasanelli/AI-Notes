import { webSearch } from "@exalabs/ai-sdk"
import { InferUITools } from "ai"

export const WebSearchTools = () => {
  return {
    webSearch: webSearch({ numResults: 5 })
  }
}

export type WebSearchToolsType = InferUITools<ReturnType<typeof WebSearchTools>>
