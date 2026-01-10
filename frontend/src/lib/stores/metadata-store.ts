import { create } from "zustand"
import { persist } from "zustand/middleware"

const defaultTags = ["symptom", "severity", "medication", "dosage", "mood", "temperature"]

interface QuickTagsStore {
  tags: string[]
  addTag: (tag: string) => void
  removeTag: (name: string) => void
  updateTag: (oldName: string, newName: string) => void
}

export const useQuickTagsStore = create<QuickTagsStore>()(
  persist(
    (set) => ({
      tags: defaultTags,
      addTag: (tag) =>
        set((state) => ({
          tags: [...state.tags, tag]
        })),
      removeTag: (name) =>
        set((state) => ({
          tags: state.tags.filter((t) => t !== name)
        })),
      updateTag: (oldName, newName) =>
        set((state) => ({
          tags: state.tags.map((t) => (t === oldName ? newName : t))
        }))
    }),
    {
      name: "quick-tags-storage"
    }
  )
)
