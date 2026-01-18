"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/schadcn/button"
import { Textarea } from "@/components/ui/schadcn/textarea"
import { DateTimePicker } from "@/components/ui/datetime-picker"
import { MetadataEditor } from "@/components/ui/metadata-editor"
import { FileUpload, type PendingFile } from "@/components/ui/file-upload"
import { toast } from "sonner"
import { createTimeNoteClient, uploadFileClient } from "@/lib/api"
import type { NoteMetadata } from "@/db/schema"
import type { NoteGranularity } from "@/lib/types/database-types"
import { useIsMobile } from "@/lib/hooks"
import { TopicEdit, TopicEditor } from "@/components/ui/topic-editor"
import { transformTopicEditToTopicBody } from "@/lib/utils"
export default function NewNotePage() {
  const [content, setContent] = useState("")
  const [startTimestamp, setStartTimestamp] = useState<Date>(new Date())
  const [endTimestamp, setEndTimestamp] = useState<Date | null>(null)
  const [granularity, setGranularity] = useState<NoteGranularity>("day")
  const [metadata, setMetadata] = useState<NoteMetadata>({})
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([])
  const queryClient = useQueryClient()
  const router = useRouter()
  const isMobile = useIsMobile()
  const [topic, setTopic] = useState<TopicEdit>({ id: null, name: "", color: "#3b82f6" })
  const mutation = useMutation({
    mutationFn: async () => {
      const noteId = await createTimeNoteClient({
        timeless: false,
        content: content.trim(),
        metadata,
        startTimestamp,
        granularity,
        endTimestamp: endTimestamp ?? null,
        topic: transformTopicEditToTopicBody(topic)
      })
      for (const pf of pendingFiles) {
        await uploadFileClient(noteId, pf.file, pf.filename)
      }
      return noteId
    },
    onSuccess: () => {
      toast.success("Note created!")
      queryClient.invalidateQueries({ queryKey: ["notes"] })
      router.push("/notes")
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
    <div className="flex flex-col w-full mt-6 md:mt-10 mb-4 px-4 md:px-10">
      <h1 className="text-2xl font-bold mb-5 md:mb-7 text-primary text-center">Add New Note</h1>
      <div className="flex flex-col gap-4 md:gap-6 w-full max-w-2xl mx-auto">
        <DateTimePicker
          startTimestamp={startTimestamp}
          endTimestamp={endTimestamp}
          onStartChange={setStartTimestamp}
          onEndChange={setEndTimestamp}
          granularity={granularity}
          onGranularityChange={setGranularity}
        />

        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write your note here..."
          rows={6}
          className="min-h-[180px] md:min-h-[200px] w-full bg-secondary focus:border-primary focus:outline-none"
          required
        />

        <div className="flex flex-col gap-3 w-full">
          <MetadataEditor value={metadata} onChange={setMetadata} />
          <FileUpload
            pendingFilestoUpload={pendingFiles}
            onPendingFilesChange={setPendingFiles}
            compact={isMobile}
          />
          <TopicEditor value={topic} onChange={setTopic} />
        </div>

        <Button
          className="text-lg font-semibold w-full md:w-fit md:self-center cursor-pointer"
          onClick={() => mutation.mutate()}
          disabled={!content.trim() || mutation.isPending}
        >
          {mutation.isPending ? "Saving..." : "Save Note"}
        </Button>
      </div>
    </div>
  )
}
