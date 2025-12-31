"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { DateTimePicker } from "@/components/ui/datetime-picker"
import { MetadataEditor } from "@/components/ui/metadata-editor"
import { toast } from "sonner"
import { createTimeNoteClient, createTimelessNoteClient } from "@/lib/api"
import type { NoteMetadata } from "@/db/schema"
import type { NoteGranularity } from "@/lib/types/database-types"
import { cn } from "@/lib/utils"

type NoteType = "general" | "timed"

export default function NewNotePage() {
  const [noteType, setNoteType] = useState<NoteType>("timed")
  const [content, setContent] = useState("")
  const [startTimestamp, setStartTimestamp] = useState<Date>(new Date())
  const [endTimestamp, setEndTimestamp] = useState<Date | null>(null)
  const [granularity, setGranularity] = useState<NoteGranularity>("day")
  const [metadata, setMetadata] = useState<NoteMetadata>({})
  const queryClient = useQueryClient()

  const resetState = () => {
    setContent("")
    setStartTimestamp(new Date())
    setEndTimestamp(null)
    setGranularity("day")
    setMetadata({})
  }

  const mutation = useMutation({
    mutationFn: () => {
      if (noteType === "general") {
        return createTimelessNoteClient(content.trim(), metadata)
      }
      return createTimeNoteClient(
        content.trim(),
        metadata,
        startTimestamp,
        granularity,
        endTimestamp ?? undefined
      )
    },
    onSuccess: (id) => {
      toast.success(`Note created with id: ${id}`)
      resetState()
      queryClient.invalidateQueries({ queryKey: ["notes"] })
      queryClient.invalidateQueries({ queryKey: ["timelessNotes"] })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to create note")
    }
  })

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      mutation.mutate()
    }
  }

  return (
    <div className="flex flex-col items-center justify-center w-full mt-10 px-10">
      <h1 className="text-2xl font-bold mb-7 text-primary text-center">Add New Note</h1>
      <div className="flex flex-col items-center gap-6 w-full max-w-md">
        <div className="flex rounded-md border border-input overflow-hidden w-fit">
          <button
            type="button"
            onClick={() => setNoteType("general")}
            className={cn(
              "px-4 py-2 text-sm transition-colors",
              noteType === "general" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
            )}
          >
            General
          </button>
          <button
            type="button"
            onClick={() => setNoteType("timed")}
            className={cn(
              "px-4 py-2 text-sm transition-colors",
              noteType === "timed" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
            )}
          >
            Timed
          </button>
        </div>

        {noteType === "timed" && (
          <DateTimePicker
            startTimestamp={startTimestamp}
            endTimestamp={endTimestamp}
            onStartChange={setStartTimestamp}
            onEndChange={setEndTimestamp}
            granularity={granularity}
            onGranularityChange={setGranularity}
          />
        )}

        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write your note here..."
          rows={6}
          className="min-h-[200px] w-full bg-secondary focus:border-primary focus:outline-none"
          required
        />
        <MetadataEditor value={metadata} onChange={setMetadata} />
        <Button
          className="text-lg font-semibold w-fit cursor-pointer"
          onClick={() => mutation.mutate()}
          disabled={!content.trim() || mutation.isPending}
        >
          {mutation.isPending ? "Saving..." : "Save Note"}
        </Button>
      </div>
    </div>
  )
}
