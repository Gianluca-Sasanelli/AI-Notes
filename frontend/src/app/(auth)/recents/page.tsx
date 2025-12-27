"use client"

import { getChatsClient } from "@/lib/api"
import type { ChatHistoryItem } from "@/lib/types/database-types"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { MessageSquare } from "lucide-react"
import { ChatDropdown } from "@/components/chat/ChatDropdown"

export default function RecentsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["chats", 0, 50],
    queryFn: () => getChatsClient(0, 50),
    staleTime: 2 * 60 * 1000,
    gcTime: 60 * 60 * 1000
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-muted-foreground">Loading chats...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-muted-foreground">Failed to load chats</div>
      </div>
    )
  }

  return (
    <div className="flex-1">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 border-b border-border px-4 py-6 sm:px-6">
          <h1 className="text-2xl font-semibold">Chat History</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {data.data.length} chat{data.data.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="px-4 sm:px-6">
          {data.data.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-8 text-center">
              <p className="text-muted-foreground">No chat history yet</p>
              <Link
                href="/chat/new"
                className="mt-4 inline-block text-sm text-primary hover:underline"
              >
                Start a new chat
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {data.data.map((chat: ChatHistoryItem) => (
                <div
                  key={chat.id}
                  className="group relative flex items-center gap-3 rounded-lg border border-transparent p-4 transition-colors hover:border-border hover:bg-accent"
                >
                  <Link
                    href={`/chat/${chat.id}`}
                    className="flex flex-1 items-center gap-3 min-w-0"
                  >
                    <MessageSquare className="size-5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{chat.title || "Untitled"}</div>
                    </div>
                  </Link>
                  <div className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
                    <ChatDropdown chatId={chat.id} currentTitle={chat.title || "Untitled"} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
