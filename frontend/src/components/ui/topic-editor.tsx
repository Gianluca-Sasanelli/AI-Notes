"use client"

import { useState } from "react"
import { Circle, X, Plus } from "lucide-react"
import { Input } from "@/components/ui/schadcn/input"
import { Button } from "@/components/ui/schadcn/button"

export type TopicEdit =
  | { id: number; name: string; color: string }
  | { id: null; name: string; color: string }
  | null

export function TopicEditor({
  value,
  onChange
}: {
  value: TopicEdit
  onChange: (v: TopicEdit) => void
}) {
  const [localColor, setLocalColor] = useState(value?.color ?? "#3b82f6")
  const [localName, setLocalName] = useState(value?.name ?? "")

  const syncColor = () => {
    if (value) onChange({ ...value, color: localColor })
  }

  const syncName = (name: string) => {
    setLocalName(name)
    if (value) onChange({ ...value, name })
  }

  if (!value) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 w-full"
        onClick={() => onChange({ id: null, name: "", color: "#3b82f6" })}
      >
        <Plus className="h-3.5 w-3.5 mr-1" />
        Topic
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-2 border rounded-md px-3 py-2 w-full">
      <label className="relative w-6 h-6 cursor-pointer">
        <Input
          type="color"
          value={localColor}
          onChange={(e) => setLocalColor(e.target.value)}
          onBlur={syncColor}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        <Circle className="w-6 h-6" fill={localColor} stroke={localColor} />
      </label>
      <Input
        placeholder="Topic name"
        value={localName}
        onChange={(e) => syncName(e.target.value)}
        className="h-8 flex-1 text-sm border-0 focus-visible:ring-0"
      />
      <Button type="button" variant="ghost" size="icon" onClick={() => onChange(null)}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
