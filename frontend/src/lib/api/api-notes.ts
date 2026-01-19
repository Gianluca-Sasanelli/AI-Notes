import { PaginatedResponse, TimeNote, TimelessNote, TopicDbData } from "@/lib/types/database-types"
import type { NoteMetadata } from "@/db/schema"
import { UpdateNoteBody, PaginationOptions, CreateNoteBody } from "@/lib/types/api-types"

type UpdateNoteFront = Omit<UpdateNoteBody, "topic">
export async function createTimeNoteClient(NoteCreateData: CreateNoteBody) {
  const res = await fetch("/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...NoteCreateData
    })
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message)
  }
  const data = (await res.json()) as { id: number }
  return data.id
}

export async function createTimelessNoteClient(content: string, metadata: NoteMetadata) {
  const res = await fetch("/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      timeless: true,
      content,
      metadata
    })
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message)
  }
  const data = (await res.json()) as { id: number }
  return data.id
}

type GetNotesOptions<T extends boolean> = PaginationOptions & { timeless?: T } & {
  topicId?: number | null
}

export async function getNotesClient(
  options: GetNotesOptions<true>
): Promise<PaginatedResponse<TimelessNote>>
export async function getNotesClient(
  options?: GetNotesOptions<false>
): Promise<PaginatedResponse<TimeNote>>
export async function getNotesClient(
  options: GetNotesOptions<boolean> = {}
): Promise<PaginatedResponse<TimeNote | TimelessNote>> {
  const { skip, limit, includeTotal, timeless, topicId } = options
  const params = new URLSearchParams()
  if (skip !== undefined) params.set("skip", skip.toString())
  if (limit !== undefined) params.set("limit", limit.toString())
  if (includeTotal) params.set("total", "true")
  if (timeless) params.set("timeless", "true")
  if (topicId) params.set("topicId", topicId.toString())

  const url = params.toString() ? `/api/notes?${params.toString()}` : "/api/notes"
  const res = await fetch(url)
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message)
  }
  return await res.json()
}

export async function getNoteClient(id: number) {
  const res = await fetch(`/api/notes/${id}`)
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message)
  }
  return (await res.json()) as TimeNote | TimelessNote
}

export async function updateNoteClient(
  id: number,
  data: UpdateNoteFront,
  topic?: { [id: number]: TopicDbData } | { new: TopicDbData } | undefined
) {
  const body: UpdateNoteBody = {
    ...data,
    topic
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
