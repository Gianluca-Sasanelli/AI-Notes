"use client"

import type { ChatUIMessage } from "@/lib/types/chat-types"
import type { JSX } from "react"

import Chat from "./Chat"

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
    <div className={"flex-1 flex flex-col overflow-y-auto h-[100svh]"}>
      <Chat
        storedmessages={storedmessages.length > 0 ? storedmessages : undefined}
        chatId={chatId}
      />
    </div>
    // </ChatProvider>
  )
}
