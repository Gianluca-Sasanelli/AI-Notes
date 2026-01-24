"use client"

import usePlaceholderUpdater from "@/lib/hooks"
import type { ChatUIMessage, chatContext } from "@/lib/types/chat-types"
import type { ChatStatus } from "ai"
import React, { useRef } from "react"
import { StatusIndicator } from "./widgets/StatusIndicator"
import { LastAssistantMessage } from "./LastAssistantMessage"
import { MessageBubble } from "./MessageBubble"

export interface ChatMessagesProps {
  messages: ChatUIMessage[]
  status: ChatStatus
  error: Error | null
  inputRef: React.RefObject<HTMLDivElement | null>
  onResendMessage: (messageId: string, selectedModel?: string, isAssistant?: boolean) => void
  onEditMessage: (
    messageId: string,
    newText: string,
    files?: FileList,
    context?: chatContext | null
  ) => void
}

const ChatMessages = React.memo(function ChatMessages({
  messages,
  status,
  error,
  onEditMessage,
  onResendMessage,
  inputRef
}: ChatMessagesProps) {
  const PlaceholderRef = useRef<HTMLDivElement | null>(null)
  const assistantLastMsgRef = useRef<HTMLDivElement | null>(null)
  const userLastMsgRef = useRef<HTMLDivElement | null>(null)
  usePlaceholderUpdater(assistantLastMsgRef, userLastMsgRef, inputRef, PlaceholderRef, status)

  let lastAssistantMessage: ChatUIMessage | null
  let otherMessages: ChatUIMessage[]
  if (messages[messages.length - 1]?.role === "assistant") {
    otherMessages = messages.slice(0, -1)
    lastAssistantMessage = messages[messages.length - 1]
  } else {
    otherMessages = messages
    lastAssistantMessage = null
  }
  const showMessageOptions = status === "ready"
  return (
    <div className="flex h-full flex-col space-y-6">
      {otherMessages.map((message, i) => (
        <MessageBubble
          key={message.id ?? `message-${i}`}
          message={message}
          messageRef={
            message.role === "user" && messages.findLastIndex((m) => m.role === "user") === i
              ? userLastMsgRef
              : undefined
          }
          onEditMessage={onEditMessage}
          onResendMessage={onResendMessage}
        />
      ))}
      <div ref={assistantLastMsgRef}>
        {lastAssistantMessage && (
          <LastAssistantMessage
            key={lastAssistantMessage.id}
            message={lastAssistantMessage}
            onResendMessage={onResendMessage}
            showMessageOptions={showMessageOptions}
          />
        )}
        <StatusIndicator
          lastAssistantMessage={lastAssistantMessage}
          chatStatus={status}
          error={error}
        />
      </div>

      <div style={{ height: "0px" }} ref={PlaceholderRef} />
    </div>
  )
})

export default ChatMessages
