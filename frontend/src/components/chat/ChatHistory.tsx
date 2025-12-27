"use client"

import { getChatsClient } from "@/lib/api"
import type { ChatHistoryItem } from "@/lib/types/database-types"
import { cn } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { MessageSquare } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function ChatHistory() {
  const { data, isLoading } = useQuery({
    queryKey: ["chats", 0, 5],
    queryFn: () => getChatsClient(0, 5),
    staleTime: 2 * 60 * 1000,
    gcTime: 60 * 60 * 1000
  })
  const pathname = usePathname()

  if (isLoading || !data) return null

  return (
    <div className="flex flex-col gap-1">
      {data.data.length === 0 ? (
        <span className="px-2 text-xs text-sidebar-foreground/60">No chat history</span>
      ) : (
        data.data.map((chat: ChatHistoryItem) => {
          const isActive = pathname === `/chat/${chat.id}`
          return (
            <Link
              key={chat.id}
              href={`/chat/${chat.id}`}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
            >
              <MessageSquare className="size-4 shrink-0" />
              <span className="truncate">{chat.title || "Untitled"}</span>
            </Link>
          )
        })
      )}
    </div>
  )
}
