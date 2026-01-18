"use client"

import { use, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Calendar,
  Tag,
  Paperclip,
  ArrowLeft,
  FileText,
  Loader2,
  ExternalLink,
  Image as ImageIcon,
  File
} from "lucide-react"
import Link from "next/link"
import { Card } from "@/components/ui/schadcn/card"
import { Badge } from "@/components/ui/schadcn/badge"
import { Button } from "@/components/ui/schadcn/button"
import { getNoteClient, getFileUrlClient } from "@/lib/api"
import { formatTimestampRange } from "@/lib/notes-utils"
import { TimeNote, TimelessNote, PaginatedResponse } from "@/lib/types/database-types"
import { isTimeNote } from "@/lib/types/api-types"
import { format } from "date-fns"

const isImageFile = (filename: string) => {
  const ext = filename.split(".").pop()?.toLowerCase()
  return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext ?? "")
}

function FileItem({ noteId, filename }: { noteId: number; filename: string }) {
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
  const { id } = use(params)
  const noteId = parseInt(id, 10)
  const queryClient = useQueryClient()

  const {
    data: note,
    isLoading,
    error
  } = useQuery({
    queryKey: ["note", noteId],
    queryFn: () => getNoteClient(noteId),
    enabled: !isNaN(noteId),
    placeholderData: () => {
      const queries = queryClient.getQueriesData<PaginatedResponse<TimeNote | TimelessNote>>({
        queryKey: ["notes"]
      })
      for (const [, data] of queries) {
        const found = data?.data.find((n) => n.id === noteId)
        if (found) return found
      }
      return undefined
    }
  })

  if (isNaN(noteId)) {
    return (
      <div className="w-full max-w-3xl mx-auto py-10 px-4">
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Invalid note ID</p>
        </Card>
      </div>
    )
  }

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

  const metadata = note.metadata as Record<string, string | number | boolean>

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
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-base leading-relaxed whitespace-pre-wrap">{note.content}</p>
        </div>

        {metadata && Object.keys(metadata).length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(metadata).map(([key, val]) => (
                <Badge key={key} variant="secondary" className="gap-1.5 py-1 text-sm font-normal">
                  <span className="font-medium">{key}:</span>
                  <span>{String(val)}</span>
                </Badge>
              ))}
            </div>
          </div>
        )}

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
    </div>
  )
}
