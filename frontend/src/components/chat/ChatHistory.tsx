"use client"

import { getChatsClient } from "@/lib/api"
import type { ChatHistoryItem } from "@/lib/types/database-types"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/lib/hooks"
import { useQuery } from "@tanstack/react-query"
import { History } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMemo } from "react"
import { ChatDropdown } from "./ChatDropdown"

type DateGroup = {
  label: string
  chats: ChatHistoryItem[]
}

function groupChatsByDate(chats: ChatHistoryItem[]): DateGroup[] {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000)
  const last7DaysStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000)
  const last30DaysStart = new Date(todayStart.getTime() - 30 * 24 * 60 * 60 * 1000)

  const groups: Record<string, ChatHistoryItem[]> = {
    Today: [],
    Yesterday: [],
    "Last 7 Days": [],
    "Last 30 Days": [],
    Older: []
  }

  for (const chat of chats) {
    const updatedAt = new Date(chat.updatedAt)
    if (updatedAt >= todayStart) {
      groups["Today"].push(chat)
    } else if (updatedAt >= yesterdayStart) {
      groups["Yesterday"].push(chat)
    } else if (updatedAt >= last7DaysStart) {
      groups["Last 7 Days"].push(chat)
    } else if (updatedAt >= last30DaysStart) {
      groups["Last 30 Days"].push(chat)
    } else {
      groups["Older"].push(chat)
    }
  }

  return Object.entries(groups)
    .filter(([, chats]) => chats.length > 0)
    .map(([label, chats]) => ({ label, chats }))
}

export function ChatHistory({ onNavigate }: { onNavigate?: () => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ["chats", 0, 20],
    queryFn: () => getChatsClient(0, 20),
    staleTime: 2 * 60 * 1000,
    gcTime: 60 * 60 * 1000
  })
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const groupedChats = useMemo(() => (data ? groupChatsByDate(data.data) : []), [data])

  if (isLoading || !data) return null

  return (
    <div className="flex flex-col gap-1">
      {data.data.length === 0 ? (
        <span className="px-2 text-md text-secondary-foreground">No chat history</span>
      ) : (
        <>
          {groupedChats.map((group) => (
            <div key={group.label}>
              <span className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {group.label}
              </span>
              {group.chats.map((chat) => {
                const isActive = pathname === `/chat/${chat.id}`
                return (
                  <div
                    key={chat.id}
                    className="group relative flex items-center rounded-md hover:bg-accent hover:text-accent !cursor-pointer"
                  >
                    <Link
                      href={`/chat/${chat.id}`}
                      onClick={onNavigate}
                      className={cn(
                        "flex-1 min-w-0 flex items-center gap-2 px-2 py-1.5 text-base rounded-md text-secondary-foreground",
                        isActive && "bg-accent "
                      )}
                    >
                      <span className="truncate" title={chat.title || "Untitled"}>
                        {chat.title || "Untitled"}
                      </span>
                    </Link>
                    <div
                      className={cn(
                        "absolute right-1 flex items-center",
                        !isMobile && "opacity-0 group-hover:opacity-100"
                      )}
                    >
                      <ChatDropdown chatId={chat.id} currentTitle={chat.title || "Untitled"} />
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
          {data.hasNext && (
            <Link
              href="/recents"
              onClick={onNavigate}
              className="group m-0 flex items-center rounded-lg border border-transparent p-1.5 px-2 transition-colors hover:bg-accent"
            >
              <History className="mr-2 size-4 shrink-0 text-sidebar-foreground/60" />
              <span className="block text-lg">All Chats</span>
            </Link>
          )}
        </>
      )}
    </div>
  )
}
