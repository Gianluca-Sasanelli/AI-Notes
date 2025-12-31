import { create } from "zustand"
import { persist } from "zustand/middleware"
import { GOOGLE_MODEL, type AIModel } from "@/lib/agents/models"

interface ModelStore {
  selectedModel: AIModel
  setSelectedModel: (model: AIModel) => void
}

export const useModelStore = create<ModelStore>()(
  persist(
    (set) => ({
      selectedModel: GOOGLE_MODEL.GEMINI_2_5_FLASH,
      setSelectedModel: (model) => set({ selectedModel: model })
    }),
    {
      name: "model-storage"
    }
  )
)
