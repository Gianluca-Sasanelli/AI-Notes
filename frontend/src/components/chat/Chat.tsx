"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useMemo, useRef } from "react"
import { toast } from "sonner"
import ChatInput from "./ChatInput"
import ChatMessages from "./messages/ChatMessages"
import { ChatUIMessage } from "@/lib/types/chat-types"
import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"

export default function Chat({
  chatId,
  storedmessages
}: {
  chatId: string | null
  storedmessages?: ChatUIMessage[]
}) {
  const backupChatId = useMemo(() => crypto.randomUUID(), [])
  const inputRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()
  const { messages, sendMessage, status, stop, error } = useChat<ChatUIMessage>({
    ...(storedmessages && { messages: storedmessages }),
    id: chatId ?? backupChatId,
    onError: (error) => {
      console.log("The error is", error)
      toast.error(error.message)
    },
    transport: new DefaultChatTransport({
      api: "/api/chat"
    })
  })

  const isLoadingFromSDK = useMemo(() => status === "streaming" || status === "submitted", [status])
  useEffect(() => {
    if (messages.length === 2 && !chatId && !isLoadingFromSDK) {
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ["chats"]
        })
      }, 4000)
    }
  }, [messages.length, chatId, queryClient, isLoadingFromSDK])
  if (messages.length === 0) {
    return (
      <>
        <div className="flex h-[100dvh] flex-col items-center justify-center gap-6 bg-background mx-10">
          <h1 className="text-center text-4xl font-bold tracking-tight text-primary">
            Medical History AI
          </h1>
          <p className="text-base text-muted-foreground">
            Ask about your medical notes and general questions.
          </p>
          <div className="flex w-full max-w-2xl flex-col rounded-xl">
            <ChatInput
              onSendMessage={(text: string, files?: FileList) => {
                sendMessage(
                  { text, files },
                  {
                    body: {
                      id: backupChatId
                    }
                  }
                )
                window.history.replaceState({}, "", `/chat/${backupChatId}`)
              }}
              isLoading={isLoadingFromSDK}
              onStopGeneration={stop}
            />
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="container mx-auto max-w-3xl flex-1 px-4 pt-3 lg:px-8">
        <ChatMessages
          messages={messages}
          status={status}
          inputRef={inputRef}
          error={error || null}
          chatId={chatId ?? backupChatId}
        />
      </div>
      <div
        className="container sticky bottom-0 z-10 mx-auto flex w-full max-w-3xl flex-col bg-background px-4 pb-2 lg:pb-5 lg:px-8"
        ref={inputRef}
        role="region"
        aria-label="Chat input"
      >
        <ChatInput
          onSendMessage={(text: string, files?: FileList) => sendMessage({ text, files })}
          isLoading={isLoadingFromSDK}
          onStopGeneration={stop}
        />
      </div>
    </>
  )
}
