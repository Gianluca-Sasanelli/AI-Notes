"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { Calendar, FileText, Tag, Pencil, Trash2, Loader2, Paperclip, Circle } from "lucide-react"
import Link from "next/link"
import { Card } from "@/components/ui/schadcn/card"
import { Badge } from "@/components/ui/schadcn/badge"
import { Button } from "@/components/ui/schadcn/button"
import { Textarea } from "@/components/ui/schadcn/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/schadcn/dialog"
import { PaginationControls } from "@/components/pagination-controls"
import { DateTimePicker } from "@/components/ui/datetime-picker"
import { MetadataEditor } from "@/components/ui/metadata-editor"
import { FileUpload, type PendingFile } from "@/components/ui/file-upload"
import {
  getNotesClient,
  updateNoteClient,
  deleteNoteClient,
  uploadFileClient,
  deleteTopic
} from "@/lib/api"
import { toast } from "sonner"
import { TimeNote, NoteGranularity } from "@/lib/types/database-types"
import type { NoteMetadata } from "@/db/schema"
import { formatTimestampRange } from "@/lib/notes-utils"
import { TopicEditor, type TopicEdit, isEditableTopic } from "@/components/ui/topic-editor"
import { TopicSelector } from "@/components/ui/topic-selector"
import { transformTopicEditToTopicBody } from "@/lib/utils"
import { T, useGT, Var } from "gt-react"
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
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([])
  const [topicEdit, setTopicEdit] = useState<TopicEdit>(null)
  const [queryTopicId, setQueryTopic] = useState<number | null>(null)
  const queryClient = useQueryClient()
  const gt = useGT()

  const { data, isLoading } = useQuery({
    queryKey: ["notes", skip, limit, queryTopicId],
    queryFn: () => getNotesClient({ skip, limit, timeless: false, topicId: queryTopicId }),
    placeholderData: keepPreviousData
  })

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (editingNote === null) {
        toast.error(gt("No note selected"))
        return Promise.reject()
      }
      const topic = transformTopicEditToTopicBody(topicEdit)
      await updateNoteClient(
        editingNote.id,
        {
          content: editingContent.trim(),
          startTimestamp: editingStartTimestamp ?? undefined,
          endTimestamp: editingEndTimestamp ?? undefined,
          granularity: editingGranularity,
          metadata: editingMetadata ?? undefined
        },
        topic
      )
      for (const pf of pendingFiles) {
        await uploadFileClient(editingNote.id, pf.file, pf.filename)
      }
    },
    onSuccess: () => {
      toast.success(gt("Note updated"))
      const noteId = editingNote?.id
      setEditingNote(null)
      setPendingFiles([])
      setTopicEdit(null)
      queryClient.invalidateQueries({ queryKey: ["notes", skip, limit] })
      queryClient.invalidateQueries({ queryKey: ["note-files", noteId] })
      queryClient.invalidateQueries({ queryKey: ["topics"] })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : gt("Failed to update"))
    }
  })

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (deletingNoteId === null) {
        toast.error(gt("No note selected"))
        return Promise.reject()
      }
      return deleteNoteClient(deletingNoteId)
    },
    onSuccess: () => {
      toast.success(gt("Note deleted"))
      setDeletingNoteId(null)
      queryClient.invalidateQueries({ queryKey: ["notes"] })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : gt("Failed to delete"))
    }
  })

  const deleteTopicMutation = useMutation({
    mutationFn: () => {
      if (queryTopicId === null) return Promise.reject()
      return deleteTopic(queryTopicId)
    },
    onSuccess: () => {
      toast.success(gt("Topic deleted"))
      setQueryTopic(null)
      queryClient.invalidateQueries({ queryKey: ["topics"] })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : gt("Failed to delete topic"))
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
    setTopicEdit(
      note.topic
        ? { id: note.topic.id, name: note.topic.name, color: note.topic.color, modified: false }
        : null
    )
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
        <>
          {queryTopicId !== null && (
            <TopicSelector
              value={queryTopicId}
              onChange={(topicId) => {
                setQueryTopic(topicId)
                setSkip(0)
              }}
            />
          )}
          <Card className="p-12">
            <div className="text-center">
              <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">
                <T>No notes yet</T>
              </p>
              {queryTopicId !== null && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-4"
                  onClick={() => deleteTopicMutation.mutate()}
                  disabled={deleteTopicMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deleteTopicMutation.isPending ? <T>Deleting...</T> : <T>Delete Topic</T>}
                </Button>
              )}
            </div>
          </Card>
        </>
      ) : (
        <>
          <div className="flex justify-between items-center mb-2">
            <TopicSelector
              value={queryTopicId}
              onChange={(topicId) => {
                setQueryTopic(topicId)
                setSkip(0)
              }}
            />
            <PaginationControls
              skip={skip}
              limit={limit}
              hasNext={hasNext}
              onParamsChange={handleParamsChange}
            />
          </div>
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

          {notes.length > 10 && (
            <PaginationControls
              skip={skip}
              limit={limit}
              hasNext={hasNext}
              onParamsChange={handleParamsChange}
              className="justify-end"
            />
          )}
        </>
      )}

      <Dialog
        open={editingNote !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingNote(null)
            setTopicEdit(null)
          }
        }}
      >
        <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[95svh] flex flex-col overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              <T>Edit Note</T>
            </DialogTitle>
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
              rows={4}
              className="min-h-[100px] focus:border-primary focus:outline-none"
            />
            <div className="flex flex-wrap items-center gap-2">
              <MetadataEditor value={editingMetadata ?? {}} onChange={setEditingMetadata} />
              <TopicEditor value={topicEdit} onChange={setTopicEdit} />
              {editingNote && (
                <FileUpload
                  noteId={editingNote.id}
                  noteFiles={editingNote.files}
                  pendingFilestoUpload={pendingFiles}
                  onPendingFilesChange={setPendingFiles}
                  onDeleteFile={(filename: string) => {
                    setEditingNote({
                      ...editingNote,
                      files: editingNote.files?.filter((f) => f !== filename) ?? undefined
                    })
                  }}
                  compact
                />
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingNote(null)}>
                <T>Cancel</T>
              </Button>
              <Button
                onClick={() => updateMutation.mutate()}
                disabled={
                  !editingContent.trim() ||
                  updateMutation.isPending ||
                  (isEditableTopic(topicEdit) && topicEdit.name.trim() === "")
                }
              >
                {updateMutation.isPending ? <T>Saving...</T> : <T>Save</T>}
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
            <DialogTitle>
              <T>Delete Note</T>
            </DialogTitle>
            <DialogDescription>
              <T>This action cannot be undone.</T>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center lg:justify-end gap-2">
            <Button variant="outline" onClick={() => setDeletingNoteId(null)}>
              <T>Cancel</T>
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? <T>Deleting...</T> : <T>Delete</T>}
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
    <Card
      className="p-4 transition-colors hover:brightness-110"
      style={note.topic ? { backgroundColor: `${note.topic.color}20` } : undefined}
    >
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
            {note.topic && (
              <span className="flex items-center gap-1.5">
                <Circle className="h-3 w-3" fill={note.topic.color} stroke={note.topic.color} />
                {note.topic.name}
              </span>
            )}
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
                <T>
                  <span>
                    <Var>{note.files.length}</Var> files
                  </span>
                </T>
              )}
            </div>
          )}
        </Link>

        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => onEdit(note)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            className="!bg-transparent !hover:bg-destructive/50"
            onClick={() => onDelete(note.id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
