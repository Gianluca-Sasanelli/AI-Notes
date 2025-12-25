import {
  NoteData,
  PaginatedResponse,
  PaginationOptions,
  UpdateNoteData
} from "@/lib/types/database-types"
import type { NoteMetadata } from "@/db/schema"

export async function createNoteClient(timestamp: Date, content: string, metadata: NoteMetadata) {
  const res = await fetch("/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timestamp: timestamp.toISOString(), content, metadata })
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message)
  }
  const data = (await res.json()) as NoteData
  return data.id
}

export async function getNotesClient(options: PaginationOptions = {}) {
  const { skip, limit, includeTotal } = options
  const params = new URLSearchParams()
  if (skip !== undefined) params.set("skip", skip.toString())
  if (limit !== undefined) params.set("limit", limit.toString())
  if (includeTotal) params.set("total", "true")

  const url = params.toString() ? `/api/notes?${params.toString()}` : "/api/notes"
  const res = await fetch(url)
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message)
  }
  return (await res.json()) as PaginatedResponse<NoteData>
}

export async function updateNoteClient(id: number, data: UpdateNoteData) {
  const body = {
    ...data,
    timestamp: data.timestamp instanceof Date ? data.timestamp.toISOString() : data.timestamp
  }
  const res = await fetch(`/api/notes/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message)
  }
}

export async function deleteNoteClient(id: number) {
  const res = await fetch(`/api/notes/${id}`, {
    method: "DELETE"
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message)
  }
}
