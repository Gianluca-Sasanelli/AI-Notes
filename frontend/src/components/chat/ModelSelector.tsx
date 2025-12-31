"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { USER_MODELS, type AIModel } from "@/lib/agents/models"
import { useModelStore } from "@/lib/stores/model-store"

export function ModelSelector() {
  const selectedModel = useModelStore((s) => s.selectedModel)
  const setSelectedModel = useModelStore((s) => s.setSelectedModel)

  return (
    <Select value={selectedModel} onValueChange={(value) => setSelectedModel(value as AIModel)}>
      <SelectTrigger className="h-8 w-auto min-w-[120px] rounded-full border bg-background px-3 text-xs">
        <SelectValue>{USER_MODELS[selectedModel]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(USER_MODELS).map(([modelId, displayName]) => (
          <SelectItem key={modelId} value={modelId} className="text-sm">
            {displayName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
