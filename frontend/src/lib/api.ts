import {
  ChatHistoryItem,
  NoteGranularity,
  PaginatedResponse,
  PaginationOptions,
  TimeNote,
  TimelessNote,
  TopicDbData,
  UpdateNoteBody,
  UserSummaryData
} from "@/lib/types/database-types"
import type { NoteMetadata } from "@/db/schema"

type UpdateNoteFront = Omit<UpdateNoteBody, "topic">
export async function createTimeNoteClient(
  content: string,
  metadata: NoteMetadata,
  startTimestamp: Date,
  granularity: NoteGranularity,
  endTimestamp?: Date
) {
  const res = await fetch("/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      timeless: false,
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

type GetNotesOptions<T extends boolean> = PaginationOptions & { timeless?: T }

export async function getNotesClient(
  options: GetNotesOptions<true>
): Promise<PaginatedResponse<TimelessNote>>
export async function getNotesClient(
  options?: GetNotesOptions<false>
): Promise<PaginatedResponse<TimeNote>>
export async function getNotesClient(
  options: GetNotesOptions<boolean> = {}
): Promise<PaginatedResponse<TimeNote | TimelessNote>> {
  const { skip, limit, includeTotal, timeless } = options
  const params = new URLSearchParams()
  if (skip !== undefined) params.set("skip", skip.toString())
  if (limit !== undefined) params.set("limit", limit.toString())
  if (includeTotal) params.set("total", "true")
  if (timeless) params.set("timeless", "true")

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

export async function regenerateUserSummaryClient() {
  const res = await fetch("/api/cron/user-note-summary", {
    method: "POST"
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message)
  }
  return res.json()
}

export async function uploadFileClient(noteId: number, file: File, filename: string) {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("filename", filename)
  let res: Response
  try {
    res = await fetch(`/api/notes/${noteId}/files`, {
      method: "POST",
      body: formData
    })
  } catch (err) {
    throw new Error(`Network error: ${err instanceof Error ? err.message : "Failed to connect"}`)
  }
  if (!res.ok) {
    let message = "Upload failed"
    try {
      const error = await res.json()
      message = error.message || message
    } catch {
      message = `Upload failed: ${res.status} ${res.statusText}`
    }
    throw new Error(message)
  }
  return (await res.json()) as { filename: string }
}

export async function getNoteFilesClient(noteId: number) {
  const res = await fetch(`/api/notes/${noteId}/files`)
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message)
  }
  return (await res.json()) as { files: string[] }
}

export async function getFileUrlClient(noteId: number, filename: string) {
  const params = new URLSearchParams({ filename })
  const res = await fetch(`/api/notes/${noteId}/files?${params.toString()}`)
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message)
  }
  return (await res.json()) as { url: string }
}

export async function deleteFileClient(noteId: number, filename: string) {
  const params = new URLSearchParams({ filename })
  const res = await fetch(`/api/notes/${noteId}/files?${params.toString()}`, {
    method: "DELETE"
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message)
  }
}
