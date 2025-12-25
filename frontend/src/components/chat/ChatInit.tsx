"use client"

import type { ChatUIMessage } from "@/lib/types/chat-types"
import { cn } from "@/lib/utils"
import type { JSX } from "react"

import Chat from "./Chat"

const scrollbarClassName =
  "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500"

type ChatInitPropsWithChatId = {
  chatId: string
  storedmessages: ChatUIMessage[]
}

type ChatInitPropsWithoutChatId = {
  chatId: null
  storedmessages: []
}

export default function ChatInit(props: ChatInitPropsWithChatId): JSX.Element
export default function ChatInit(props: ChatInitPropsWithoutChatId): JSX.Element
export default function ChatInit({
  chatId,
  storedmessages
}: ChatInitPropsWithChatId | ChatInitPropsWithoutChatId) {
  return (
    // <ChatProvider initialState={storedState ?? initializeChatState()}>
    <div className={cn("flex-1 flex flex-col overflow-y-auto h-screen", scrollbarClassName)}>
      <Chat
        storedmessages={storedmessages.length > 0 ? storedmessages : undefined}
        chatId={chatId}
      />
    </div>
    // </ChatProvider>
  )
}
