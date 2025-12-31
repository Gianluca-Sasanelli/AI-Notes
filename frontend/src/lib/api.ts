import {
  ChatHistoryItem,
  NoteData,
  NoteGranularity,
  PaginatedResponse,
  PaginationOptions,
  UpdateNoteData,
  UserSummaryData
} from "@/lib/types/database-types"
import type { NoteMetadata } from "@/db/schema"

export async function createNoteClient(
  startTimestamp: Date,
  content: string,
  metadata: NoteMetadata,
  endTimestamp?: Date,
  granularity?: NoteGranularity
) {
  const res = await fetch("/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      startTimestamp: startTimestamp.toISOString(),
      endTimestamp: endTimestamp?.toISOString(),
      granularity,
      content,
      metadata
    })
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
    startTimestamp:
      data.startTimestamp instanceof Date ? data.startTimestamp.toISOString() : data.startTimestamp,
    endTimestamp:
      data.endTimestamp instanceof Date ? data.endTimestamp.toISOString() : data.endTimestamp
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

export async function getChatsClient(skip: number = 0, limit: number = 10) {
  const params = new URLSearchParams()
  params.set("skip", skip.toString())
  params.set("limit", limit.toString())
  const res = await fetch(`/api/chats?${params.toString()}`)
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message)
  }
  return (await res.json()) as PaginatedResponse<ChatHistoryItem>
}

export async function updateChatClient(chatId: string, title: string) {
  const res = await fetch(`/api/chats/${chatId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title })
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message)
  }
}

export async function deleteChatClient(chatId: string) {
  const res = await fetch(`/api/chats/${chatId}`, {
    method: "DELETE"
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message)
  }
}

export async function getUserSummaryClient(): Promise<UserSummaryData | null> {
  const res = await fetch("/api/user-summary")
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message)
  }
  const data = await res.json()
  return data.summary
}

export async function updateUserSummaryClient(notesSummary: string) {
  const res = await fetch("/api/user-summary", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notesSummary })
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message)
  }
}
