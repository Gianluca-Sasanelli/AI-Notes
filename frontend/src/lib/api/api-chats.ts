import { ChatHistoryItem, PaginatedResponse } from "@/lib/types/database-types"

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
