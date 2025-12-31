"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { Calendar, FileText, Tag, Pencil, Trash2, Loader2, Infinity } from "lucide-react"
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
import { getNotesClient, updateNoteClient, deleteNoteClient } from "@/lib/api"
import { toast } from "sonner"
import { TimeNote, TimelessNote, NoteGranularity, isTimeNote } from "@/lib/types/database-types"
import type { NoteMetadata } from "@/db/schema"
import { formatTimestampRange } from "@/lib/notes-utils"
import { cn } from "@/lib/utils"

type ViewMode = "timed" | "general"

export function NotesList() {
  const [viewMode, setViewMode] = useState<ViewMode>("timed")
  const [skip, setSkip] = useState(0)
  const [limit, setLimit] = useState(10)
  const [editingNote, setEditingNote] = useState<TimeNote | TimelessNote | null>(null)
  const [deletingNoteId, setDeletingNoteId] = useState<number | null>(null)
  const [editingContent, setEditingContent] = useState("")
  const [editingStartTimestamp, setEditingStartTimestamp] = useState(new Date())
  const [editingEndTimestamp, setEditingEndTimestamp] = useState<Date | null>(null)
  const [editingGranularity, setEditingGranularity] = useState<NoteGranularity>("day")
  const [editingMetadata, setEditingMetadata] = useState<NoteMetadata | null>(null)
  const queryClient = useQueryClient()

  const isTimeless = viewMode === "general"

  const { data: timeNotesData, isLoading: timeNotesLoading } = useQuery({
    queryKey: ["notes", skip, limit],
    queryFn: () => getNotesClient({ skip, limit, timeless: false }),
    placeholderData: keepPreviousData,
    enabled: !isTimeless
  })

  const { data: timelessNotesData, isLoading: timelessNotesLoading } = useQuery({
    queryKey: ["timelessNotes", skip, limit],
    queryFn: () => getNotesClient({ skip, limit, timeless: true }),
    placeholderData: keepPreviousData,
    enabled: isTimeless
  })

  const data = isTimeless ? timelessNotesData : timeNotesData
  const isLoading = isTimeless ? timelessNotesLoading : timeNotesLoading

  const updateMutation = useMutation({
    mutationFn: () => {
      if (editingNote === null) {
        toast.error("No note selected")
        return Promise.reject()
      }
      if (isTimeNote(editingNote)) {
        return updateNoteClient(editingNote.id, {
          content: editingContent.trim(),
          startTimestamp: editingStartTimestamp,
          endTimestamp: editingEndTimestamp,
          granularity: editingGranularity,
          metadata: editingMetadata
        })
      }
      return updateNoteClient(editingNote.id, {
        content: editingContent.trim(),
        metadata: editingMetadata
      })
    },
    onSuccess: () => {
      toast.success("Note updated")
      setEditingNote(null)
      queryClient.invalidateQueries({ queryKey: ["notes"] })
      queryClient.invalidateQueries({ queryKey: ["timelessNotes"] })
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
      queryClient.invalidateQueries({ queryKey: ["timelessNotes"] })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to delete")
    }
  })

  const handleParamsChange = (params: { skip?: number; limit?: number }) => {
    if (params.skip !== undefined) setSkip(params.skip)
    if (params.limit !== undefined) setLimit(params.limit)
  }

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode)
    setSkip(0)
  }

  const handleEditOpen = (note: TimeNote | TimelessNote) => {
    setEditingContent(note.content)
    if (isTimeNote(note)) {
      setEditingStartTimestamp(new Date(note.startTimestamp))
      setEditingEndTimestamp(note.endTimestamp ? new Date(note.endTimestamp) : null)
      setEditingGranularity(note.granularity)
    }
    setEditingMetadata(note.metadata)
    setEditingNote(note)
  }

  const notes = data?.data ?? []
  const hasNext = data?.hasNext ?? false

  return (
    <div className="space-y-4">
      <div className="flex rounded-md border border-input overflow-hidden w-fit">
        <button
          type="button"
          onClick={() => handleViewModeChange("general")}
          className={cn(
            "px-4 py-2 text-sm transition-colors flex items-center gap-2",
            viewMode === "general" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
          )}
        >
          <Infinity className="h-4 w-4" />
          General
        </button>
        <button
          type="button"
          onClick={() => handleViewModeChange("timed")}
          className={cn(
            "px-4 py-2 text-sm transition-colors flex items-center gap-2",
            viewMode === "timed" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
          )}
        >
          <Calendar className="h-4 w-4" />
          Timed
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : notes.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">
              No {viewMode === "general" ? "general" : "timed"} notes yet
            </p>
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
            {isTimeless
              ? (timelessNotesData?.data ?? []).map((note) => (
                  <TimelessNoteCard
                    key={note.id}
                    note={note}
                    onEdit={handleEditOpen}
                    onDelete={setDeletingNoteId}
                  />
                ))
              : (timeNotesData?.data ?? []).map((note) => (
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
        <DialogContent className="w-[90dvh]">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {editingNote && isTimeNote(editingNote) && (
              <DateTimePicker
                startTimestamp={editingStartTimestamp}
                endTimestamp={editingEndTimestamp}
                onStartChange={setEditingStartTimestamp}
                onEndChange={setEditingEndTimestamp}
                granularity={editingGranularity}
                onGranularityChange={setEditingGranularity}
              />
            )}
            <Textarea
              value={editingContent}
              onChange={(e) => setEditingContent(e.target.value)}
              rows={5}
              className="min-h-[120px] focus:border-primary focus:outline-none"
            />
            <MetadataEditor value={editingMetadata ?? {}} onChange={setEditingMetadata} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingNote(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => updateMutation.mutate()}
                disabled={!editingContent.trim() || updateMutation.isPending}
              >
                {updateMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deletingNoteId !== null}
        onOpenChange={(open) => !open && setDeletingNoteId(null)}
      >
        <DialogContent className="w-[70dvh]">
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
        <div className="min-w-0 flex-1 space-y-2">
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
        </div>

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

function TimelessNoteCard({
  note,
  onEdit,
  onDelete
}: {
  note: TimelessNote
  onEdit: (note: TimelessNote) => void
  onDelete: (id: number) => void
}) {
  const noteMetadata = note.metadata as Record<string, string | number | boolean> | null

  return (
    <Card className="p-4 transition-colors hover:bg-accent/30 border-l-4 border-l-primary/50">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-2">
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
        </div>

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
