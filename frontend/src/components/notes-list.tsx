"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { format } from "date-fns"
import { Calendar, Clock, FileText, Tag, Pencil, Trash2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
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
import type { NoteData } from "@/lib/types"
import type { NoteMetadata } from "@/db/schema"

export function NotesList() {
  const [skip, setSkip] = useState(0)
  const [limit, setLimit] = useState(10)
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null)
  const [deletingNoteId, setDeletingNoteId] = useState<number | null>(null)
  const [editingContent, setEditingContent] = useState("")
  const [editingTimestamp, setEditingTimestamp] = useState(new Date())
  const [editingMetadata, setEditingMetadata] = useState<NoteMetadata | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["notes", skip, limit],
    queryFn: () => getNotesClient({ skip, limit }),
    placeholderData: keepPreviousData
  })

  const updateMutation = useMutation({
    mutationFn: () => {
      if (editingNoteId === null) {
        toast.error("No note selected")
        return Promise.reject()
      }
      return updateNoteClient(editingNoteId, {
        content: editingContent.trim(),
        timestamp: editingTimestamp,
        metadata: editingMetadata
      })
    },
    onSuccess: () => {
      toast.success("Note updated")
      setEditingNoteId(null)
      queryClient.invalidateQueries({ queryKey: ["notes"] })
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

  const handleEditOpen = (note: NoteData) => {
    setEditingContent(note.content)
    setEditingTimestamp(new Date(note.timestamp))
    setEditingMetadata(note.metadata)
    setEditingNoteId(note.id)
  }

  if (isLoading) {
    return <NotesListSkeleton />
  }

  const notes = data?.data ?? []
  const hasNext = data?.hasNext ?? false

  if (notes.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">No notes yet</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <PaginationControls
        skip={skip}
        limit={limit}
        hasNext={hasNext}
        onParamsChange={handleParamsChange}
      />

      <div className="space-y-3">
        {notes.map((note) => (
          <NoteCard
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

      <Dialog
        open={editingNoteId !== null}
        onOpenChange={(open) => !open && setEditingNoteId(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <DateTimePicker value={editingTimestamp} onChange={setEditingTimestamp} />
            <Textarea
              value={editingContent}
              onChange={(e) => setEditingContent(e.target.value)}
              rows={5}
              className="min-h-[120px]"
            />
            <MetadataEditor value={editingMetadata ?? {}} onChange={setEditingMetadata} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingNoteId(null)}>
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
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
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

function NoteCard({
  note,
  onEdit,
  onDelete
}: {
  note: NoteData
  onEdit: (note: NoteData) => void
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
              {format(new Date(note.timestamp), "EEE, MMM d, yyyy")}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {format(new Date(note.timestamp), "HH:mm")}
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
function NotesListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-[130px]" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-16" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-9" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="space-y-3">
              <div className="flex gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
