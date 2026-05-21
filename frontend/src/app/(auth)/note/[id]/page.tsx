"use client"

import { use, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Calendar,
  Paperclip,
  ArrowLeft,
  FileText,
  Loader2,
  ExternalLink,
  Image as ImageIcon,
  File,
  Pencil,
  Trash2,
  Circle
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/schadcn/card"
import { Button } from "@/components/ui/schadcn/button"
import { Textarea } from "@/components/ui/schadcn/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/schadcn/dialog"
import { DateTimePicker } from "@/components/ui/datetime-picker"
import { FileUpload, type PendingFile } from "@/components/ui/file-upload"
import { TopicEditor, type TopicEdit, isEditableTopic } from "@/components/ui/topic-editor"
import {
  getNoteClient,
  getFileUrlClient,
  updateNoteClient,
  deleteNoteClient,
  uploadFileClient
} from "@/lib/api"
import { formatTimestampRange } from "@/lib/notes-utils"
import {
  TimeNote,
  TimelessNote,
  NoteGranularity,
  PaginatedResponse
} from "@/lib/types/database-types"
import { isTimeNote } from "@/lib/types/api-types"
import { transformTopicEditToTopicBody } from "@/lib/utils"
import { format } from "date-fns"
import { toast } from "sonner"

const isImageFile = (filename: string) => {
  const ext = filename.split(".").pop()?.toLowerCase()
  return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext ?? "")
}

function FileItem({ noteId, filename }: { noteId: string; filename: string }) {
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    if (url) {
      window.open(url, "_blank")
      return
    }
    setLoading(true)
    try {
      const { url: fileUrl } = await getFileUrlClient(noteId, filename)
      setUrl(fileUrl)
      window.open(fileUrl, "_blank")
    } finally {
      setLoading(false)
    }
  }

  const isImage = isImageFile(filename)

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors text-left w-full"
    >
      {isImage ? (
        <ImageIcon className="h-5 w-5 text-muted-foreground shrink-0" />
      ) : (
        <File className="h-5 w-5 text-muted-foreground shrink-0" />
      )}
      <span className="truncate flex-1 text-xs sm:text-sm max-w-[10rem] sm:max-w-none">
        {filename}
      </span>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
      ) : (
        <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
      )}
    </Button>
  )
}

export default function NotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: noteId } = use(params)
  const queryClient = useQueryClient()
  const router = useRouter()

  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editingContent, setEditingContent] = useState("")
  const [editingStartTimestamp, setEditingStartTimestamp] = useState(new Date())
  const [editingEndTimestamp, setEditingEndTimestamp] = useState<Date | null>(null)
  const [editingGranularity, setEditingGranularity] = useState<NoteGranularity>("day")
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([])
  const [topicEdit, setTopicEdit] = useState<TopicEdit>(null)
  const [editingFiles, setEditingFiles] = useState<string[]>([])

  const {
    data: note,
    isLoading,
    error
  } = useQuery({
    queryKey: ["note", noteId],
    queryFn: () => getNoteClient(noteId),
    enabled: noteId.length > 0,
    placeholderData: () => {
      const queries = queryClient.getQueriesData<PaginatedResponse<TimeNote | TimelessNote>>({
        queryKey: ["notes"]
      })
      for (const [, data] of queries) {
        const found = data?.data?.find((n) => n._id === noteId)
        if (found) return found
      }
      return undefined
    }
  })

  const handleEditOpen = () => {
    if (!note) return
    setEditingContent(note.content)
    if (isTimeNote(note)) {
      setEditingStartTimestamp(new Date(note.startTimestamp))
      setEditingEndTimestamp(note.endTimestamp ? new Date(note.endTimestamp) : null)
      setEditingGranularity(note.granularity)
      setTopicEdit(
        note.topic
          ? { _id: note.topic._id, name: note.topic.name, color: note.topic.color, modified: false }
          : null
      )
    }
    setEditingFiles(note.files ? [...note.files] : [])
    setEditing(true)
  }

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!note) return Promise.reject()
      const topic = isTimeNote(note) ? transformTopicEditToTopicBody(topicEdit) : undefined
      await updateNoteClient(
        noteId,
        {
          content: editingContent.trim(),
          ...(isTimeNote(note) && {
            startTimestamp: editingStartTimestamp.getTime(),
            endTimestamp: editingEndTimestamp ? editingEndTimestamp.getTime() : null,
            granularity: editingGranularity
          })
        },
        topic
      )
      for (const pf of pendingFiles) {
        await uploadFileClient(noteId, pf.file, pf.filename)
      }
    },
    onSuccess: () => {
      toast.success("Note updated")
      setEditing(false)
      setPendingFiles([])
      setTopicEdit(null)
      queryClient.invalidateQueries({ queryKey: ["note", noteId] })
      queryClient.invalidateQueries({ queryKey: ["notes"] })
      queryClient.invalidateQueries({ queryKey: ["note-files", noteId] })
      queryClient.invalidateQueries({ queryKey: ["topics"] })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update")
    }
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteNoteClient(noteId),
    onSuccess: () => {
      toast.success("Note deleted")
      queryClient.invalidateQueries({ queryKey: ["notes"] })
      router.push("/notes")
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to delete")
    }
  })

  if (isLoading) {
    return (
      <div className="w-full max-w-3xl mx-auto py-10 px-4">
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error || !note) {
    return (
      <div className="w-full max-w-3xl mx-auto py-10 px-4">
        <Card className="p-12 text-center">
          <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : "Note not found"}
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-3xl mx-auto py-10 px-4 overflow-y-auto">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/notes">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Notes
          </Link>
        </Button>
      </div>

      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {isTimeNote(note)
                ? formatTimestampRange(
                    new Date(note.startTimestamp),
                    note.endTimestamp ? new Date(note.endTimestamp) : null,
                    note.granularity
                  )
                : format(new Date(note.createdAt), "EEE, MMM d, yyyy 'at' HH:mm")}
            </span>
            {isTimeNote(note) && note.topic && (
              <span className="flex items-center gap-1.5">
                <Circle className="h-3 w-3" fill={note.topic.color} stroke={note.topic.color} />
                {note.topic.name}
              </span>
            )}
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={handleEditOpen}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              className="!bg-transparent"
              onClick={() => setDeleting(true)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-base leading-relaxed whitespace-pre-wrap">{note.content}</p>
        </div>

        {note.files && note.files.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Paperclip className="h-4 w-4" />
              Files ({note.files.length})
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {note.files.map((filename) => (
                <FileItem key={filename} noteId={noteId} filename={filename} />
              ))}
            </div>
          </div>
        )}
      </Card>

      <Dialog
        open={editing}
        onOpenChange={(open) => {
          if (!open) {
            setEditing(false)
            setTopicEdit(null)
          }
        }}
      >
        <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[95svh] flex flex-col overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 w-full min-w-0 flex-1">
            {isTimeNote(note) && (
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
              rows={4}
              className="min-h-[100px] focus:border-primary focus:outline-none"
            />
            <div className="flex flex-wrap items-center gap-2">
              {isTimeNote(note) && <TopicEditor value={topicEdit} onChange={setTopicEdit} />}
              <FileUpload
                noteId={noteId}
                noteFiles={editingFiles}
                pendingFilestoUpload={pendingFiles}
                onPendingFilesChange={setPendingFiles}
                onDeleteFile={(filename: string) => {
                  setEditingFiles((prev) => prev?.filter((f) => f !== filename))
                }}
                compact
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => updateMutation.mutate()}
                disabled={
                  !editingContent.trim() ||
                  updateMutation.isPending ||
                  (isEditableTopic(topicEdit) && topicEdit.name.trim() === "")
                }
              >
                {updateMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleting} onOpenChange={(open) => !open && setDeleting(false)}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-center lg:justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleting(false)}>
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
