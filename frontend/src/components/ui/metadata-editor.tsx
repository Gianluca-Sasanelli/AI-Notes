"use client"

import * as React from "react"
import { Plus, X, Tag } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import type { NoteMetadata } from "@/db/schema"

interface MetadataEditorProps {
  value: NoteMetadata
  onChange: (value: NoteMetadata) => void
}

const SUGGESTIONS = [
  { key: "symptom", placeholder: "e.g., headache, nausea" },
  { key: "severity", placeholder: "1-10" },
  { key: "medication", placeholder: "e.g., ibuprofen" },
  { key: "dosage", placeholder: "e.g., 400mg" },
  { key: "mood", placeholder: "e.g., anxious, calm" },
  { key: "temperature", placeholder: "e.g., 37.5" }
]

export function MetadataEditor({ value, onChange }: MetadataEditorProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [newKey, setNewKey] = React.useState("")
  const [newValue, setNewValue] = React.useState("")

  const entries = Object.entries(value)

  const handleAdd = () => {
    if (!newKey.trim() || !newValue.trim()) return
    onChange({ ...value, [newKey.trim().toLowerCase()]: newValue.trim() })
    setNewKey("")
    setNewValue("")
  }

  const handleRemove = (key: string) => {
    const next = { ...value }
    delete next[key]
    onChange(next)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAdd()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setNewKey(suggestion)
  }

  return (
    <div className="w-full">
      {entries.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {entries.map(([key, val]) => (
            <Badge
              key={key}
              variant="secondary"
              className="pl-2 pr-1 py-1.5 gap-1.5 text-sm font-normal"
            >
              <span className="font-medium text-primary">{key}:</span>
              <span>{String(val)}</span>
              <button
                onClick={() => handleRemove(key)}
                className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {!isOpen ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <Tag className="h-4 w-4" />
          Add Metadata
        </Button>
      ) : (
        <div className="border rounded-lg p-4 bg-muted/30 space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Key"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Input
              placeholder="Value"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button
              type="button"
              size="icon"
              onClick={handleAdd}
              disabled={!newKey.trim() || !newValue.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.filter((s) => !value[s.key]).map((suggestion) => (
              <button
                key={suggestion.key}
                type="button"
                onClick={() => handleSuggestionClick(suggestion.key)}
                className={cn(
                  "px-2.5 py-1 text-xs rounded-full transition-colors",
                  "bg-background border hover:bg-accent hover:text-accent-foreground",
                  newKey === suggestion.key && "bg-primary/10 border-primary text-primary"
                )}
              >
                {suggestion.key}
              </button>
            ))}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="w-full text-muted-foreground"
          >
            Done
          </Button>
        </div>
      )}
    </div>
  )
}
