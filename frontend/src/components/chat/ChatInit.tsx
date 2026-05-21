"use client"

import type { ChatUIMessage } from "@/lib/types/chat-types"
import type { JSX } from "react"
import { useRef } from "react"

import Chat from "./Chat"

type ChatInitPropsWithChatId = {
  chatId: string
  storedmessages: ChatUIMessage[]
  isStreaming?: boolean
}

type ChatInitPropsWithoutChatId = {
  chatId: null
  storedmessages: []
  isStreaming?: false
}

export default function ChatInit(props: ChatInitPropsWithChatId): JSX.Element
export default function ChatInit(props: ChatInitPropsWithoutChatId): JSX.Element
export default function ChatInit({
  chatId,
  storedmessages,
  isStreaming
}: ChatInitPropsWithChatId | ChatInitPropsWithoutChatId) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={scrollContainerRef} className={"flex-1 flex flex-col overflow-y-auto h-[100svh]"}>
      <Chat
        storedmessages={storedmessages.length > 0 ? storedmessages : undefined}
        chatId={chatId}
        isStreaming={isStreaming}
        scrollContainerRef={scrollContainerRef}
      />
    </div>
  )
}
