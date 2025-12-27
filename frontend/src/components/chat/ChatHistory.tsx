"use client"

import { getChatsClient } from "@/lib/api"
import type { ChatHistoryItem } from "@/lib/types/database-types"
import { cn } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { MessageSquare, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChatDropdown } from "./ChatDropdown"

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
        <>
          {data.data.map((chat: ChatHistoryItem) => {
            const isActive = pathname === `/chat/${chat.id}`
            return (
              <div
                key={chat.id}
                className="group relative flex items-center rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <Link
                  href={`/chat/${chat.id}`}
                  className={cn(
                    "flex-1 flex items-center gap-2 px-2 py-1.5 text-sm text-sidebar-foreground rounded-md",
                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                >
                  <MessageSquare className="size-4 shrink-0" />
                  <span className="truncate">{chat.title || "Untitled"}</span>
                </Link>
                <div className="absolute right-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <ChatDropdown chatId={chat.id} currentTitle={chat.title || "Untitled"} />
                </div>
              </div>
            )
          })}
          {data.hasNext && (
            <Link
              href="/recents"
              className="group m-0 flex items-center rounded-lg border border-transparent p-1.5 px-2 transition-colors hover:border-sidebar-border hover:bg-sidebar-accent text-xs text-sidebar-foreground"
            >
              <Settings className="mr-2 size-4 shrink-0 text-sidebar-foreground/60" />
              <span className="block font-medium">All Chats</span>
            </Link>
          )}
        </>
      )}
    </div>
  )
}
