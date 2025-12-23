"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { Calendar, Clock, FileText, Tag } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { PaginationControls } from "@/components/pagination-controls"
import { getNotesClient } from "@/lib/api"
import type { NoteData } from "@/lib/types"

export function NotesList() {
  const [skip, setSkip] = useState(0)
  const [limit, setLimit] = useState(10)

  const { data, isLoading } = useQuery({
    queryKey: ["notes", skip, limit],
    queryFn: () => getNotesClient({ skip, limit })
  })

  const handleParamsChange = (params: { skip?: number; limit?: number }) => {
    if (params.skip !== undefined) setSkip(params.skip)
    if (params.limit !== undefined) setLimit(params.limit)
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
          <NoteCard key={note.id} note={note} />
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
    </div>
  )
}

function NoteCard({ note }: { note: NoteData }) {
  const metadata = note.metadata as Record<string, string | number | boolean> | null

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

          {metadata && Object.keys(metadata).length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {Object.entries(metadata).map(([key, val]) => (
                <Badge key={key} variant="secondary" className="gap-1 py-0.5 text-xs font-normal">
                  <Tag className="h-3 w-3" />
                  <span className="font-medium">{key}:</span>
                  <span>{String(val)}</span>
                </Badge>
              ))}
            </div>
          )}
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
