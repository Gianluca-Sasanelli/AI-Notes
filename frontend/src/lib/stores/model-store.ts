import { create } from "zustand"
import { persist } from "zustand/middleware"
import { GROQ_MODEL, type AIModel } from "@/lib/agents/models"

interface ModelStore {
  selectedModel: AIModel
  setSelectedModel: (model: AIModel) => void
}

export const useModelStore = create<ModelStore>()(
  persist(
    (set) => ({
      selectedModel: GROQ_MODEL.KIMI_K2,
      setSelectedModel: (model) => set({ selectedModel: model })
    }),
    {
      name: "model-storage"
    }
  )
)
