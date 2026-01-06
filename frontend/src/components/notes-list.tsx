"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { Calendar, FileText, Tag, Pencil, Trash2, Loader2, Paperclip } from "lucide-react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"
import { PaginationControls } from "@/components/pagination-controls"
import { DateTimePicker } from "@/components/ui/datetime-picker"
import { MetadataEditor } from "@/components/ui/metadata-editor"
import { FileUpload } from "@/components/ui/file-upload"
import { getNotesClient, updateNoteClient, deleteNoteClient, uploadFileClient } from "@/lib/api"
import { toast } from "sonner"
import { TimeNote, NoteGranularity } from "@/lib/types/database-types"
import type { NoteMetadata } from "@/db/schema"
import { formatTimestampRange } from "@/lib/notes-utils"
export function NotesList() {
  const [skip, setSkip] = useState(0)
  const [limit, setLimit] = useState(10)
  const [editingNote, setEditingNote] = useState<TimeNote | null>(null)
  const [deletingNoteId, setDeletingNoteId] = useState<number | null>(null)
  const [editingContent, setEditingContent] = useState("")
  const [editingStartTimestamp, setEditingStartTimestamp] = useState(new Date())
  const [editingEndTimestamp, setEditingEndTimestamp] = useState<Date | null>(null)
  const [editingGranularity, setEditingGranularity] = useState<NoteGranularity>("day")
  const [editingMetadata, setEditingMetadata] = useState<NoteMetadata | null>(null)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ["notes", skip, limit],
    queryFn: () => getNotesClient({ skip, limit, timeless: false }),
    placeholderData: keepPreviousData
  })

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (editingNote === null) {
        toast.error("No note selected")
        return Promise.reject()
      }
      await updateNoteClient(editingNote.id, {
        content: editingContent.trim(),
        startTimestamp: editingStartTimestamp,
        endTimestamp: editingEndTimestamp,
        granularity: editingGranularity,
        metadata: editingMetadata
      })
      for (const file of pendingFiles) {
        await uploadFileClient(editingNote.id, file)
      }
    },
    onSuccess: () => {
      toast.success("Note updated")
      setEditingNote(null)
      setPendingFiles([])
      queryClient.invalidateQueries({ queryKey: ["notes"] })
      queryClient.invalidateQueries({ queryKey: ["note-files", editingNote?.id] })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update")
    }
  })

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (deletingNoteId === null) {
        toast.error("No note selected")
        return Promise.reject()
      }
      return deleteNoteClient(deletingNoteId)
    },
    onSuccess: () => {
      toast.success("Note deleted")
      setDeletingNoteId(null)
      queryClient.invalidateQueries({ queryKey: ["notes"] })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to delete")
    }
  })

  const handleParamsChange = (params: { skip?: number; limit?: number }) => {
    if (params.skip !== undefined) setSkip(params.skip)
    if (params.limit !== undefined) setLimit(params.limit)
  }

  const handleEditOpen = (note: TimeNote) => {
    setEditingContent(note.content)
    setEditingStartTimestamp(new Date(note.startTimestamp))
    setEditingEndTimestamp(note.endTimestamp ? new Date(note.endTimestamp) : null)
    setEditingGranularity(note.granularity)
    setEditingMetadata(note.metadata)
    setEditingNote(note)
  }

  const notes = data?.data ?? []
  const hasNext = data?.hasNext ?? false

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : notes.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">No notes yet</p>
          </div>
        </Card>
      ) : (
        <>
          <PaginationControls
            skip={skip}
            limit={limit}
            hasNext={hasNext}
            onParamsChange={handleParamsChange}
          />

          <div className="space-y-3">
            {notes.map((note) => (
              <TimeNoteCard
                key={note.id}
                note={note}
                onEdit={handleEditOpen}
                onDelete={setDeletingNoteId}
              />
            ))}
          </div>

          {notes.length >= 5 && (
            <PaginationControls
              skip={skip}
              limit={limit}
              hasNext={hasNext}
              onParamsChange={handleParamsChange}
            />
          )}
        </>
      )}

      <Dialog open={editingNote !== null} onOpenChange={(open) => !open && setEditingNote(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[95dvh] flex flex-col overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 w-full min-w-0 flex-1">
            <DateTimePicker
              startTimestamp={editingStartTimestamp}
              endTimestamp={editingEndTimestamp}
              onStartChange={setEditingStartTimestamp}
              onEndChange={setEditingEndTimestamp}
              granularity={editingGranularity}
              onGranularityChange={setEditingGranularity}
            />
            <Textarea
              value={editingContent}
              onChange={(e) => setEditingContent(e.target.value)}
              rows={5}
              className="min-h-[120px] focus:border-primary focus:outline-none"
            />
            <div className="flex flex-col gap-3 w-full">
              <MetadataEditor value={editingMetadata ?? {}} onChange={setEditingMetadata} />
              {editingNote && (
                <div className="sm:hidden w-full">
                  <FileUpload
                    noteId={editingNote.id}
                    pendingFiles={pendingFiles}
                    onFilesChange={setPendingFiles}
                    compact
                  />
                </div>
              )}
            </div>
            {editingNote && (
              <div className="hidden sm:block">
                <FileUpload
                  noteId={editingNote.id}
                  pendingFiles={pendingFiles}
                  onFilesChange={setPendingFiles}
                />
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingNote(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => updateMutation.mutate()}
                disabled={!editingContent.trim() || updateMutation.isPending}
              >
                {updateMutation.isPending ? "Editing..." : "Edit"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deletingNoteId !== null}
        onOpenChange={(open) => !open && setDeletingNoteId(null)}
      >
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-center lg:justify-end gap-2">
            <Button variant="outline" onClick={() => setDeletingNoteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function TimeNoteCard({
  note,
  onEdit,
  onDelete
}: {
  note: TimeNote
  onEdit: (note: TimeNote) => void
  onDelete: (id: number) => void
}) {
  const noteMetadata = note.metadata as Record<string, string | number | boolean> | null

  return (
    <Card className="p-4 transition-colors hover:bg-accent/30">
      <div className="flex items-start justify-between gap-4">
        <Link href={`/note/${note.id}`} className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatTimestampRange(
                new Date(note.startTimestamp),
                note.endTimestamp ? new Date(note.endTimestamp) : null,
                note.granularity
              )}
            </span>
          </div>

          <p className="text-sm leading-relaxed">{note.content}</p>

          {noteMetadata && Object.keys(noteMetadata).length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {Object.entries(noteMetadata).map(([key, val]) => (
                <Badge key={key} variant="secondary" className="gap-1 py-0.5 text-xs font-normal">
                  <Tag className="h-3 w-3" />
                  <span className="font-medium">{key}:</span>
                  <span>{String(val)}</span>
                </Badge>
              ))}
            </div>
          )}

          {note.files && note.files.length > 0 && (
            <div className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
              <Paperclip className="h-3 w-3" />
              {note.files.length <= 2 ? (
                <span>{note.files.join(", ")}</span>
              ) : (
                <span>{note.files.length} files</span>
              )}
            </div>
          )}
        </Link>

        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => onEdit(note)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(note.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
