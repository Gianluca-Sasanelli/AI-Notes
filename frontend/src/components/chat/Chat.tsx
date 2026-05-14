"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useCallback, useEffect, useMemo, useRef } from "react"
import ChatInput from "./ChatInput"
import ChatMessages from "./messages/ChatMessages"
import { ChatUIMessage, extractTextFromMessage } from "@/lib/types/chat-types"
import { useQueryClient } from "@tanstack/react-query"
import { useModelStore } from "@/lib/stores/model-store"
import { handleChatError, isNetworkError } from "@/lib/chat-error"
import { T } from "gt-react"
export default function Chat({
  chatId,
  storedmessages,
  isStreaming
}: {
  chatId: string | null
  storedmessages?: ChatUIMessage[]
  isStreaming?: boolean
}) {
  const backupChatId = useMemo(() => crypto.randomUUID(), [])
  const inputRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()
  const selectedModel = useModelStore((s) => s.selectedModel)
  const activeChatId = chatId ?? backupChatId
  const { messages, sendMessage, setMessages, status, stop, error, clearError, resumeStream } =
    useChat<ChatUIMessage>({
      ...(storedmessages && { messages: storedmessages }),
      id: activeChatId,
      onError: handleChatError,
      experimental_throttle: 100,
      resume: !!isStreaming,
      transport: new DefaultChatTransport({
        api: "/api/chat",
        prepareReconnectToStreamRequest({ id }) {
          return { api: `/api/chat/${id}/stream` }
        }
      })
    })

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState !== "visible") return
      if (status !== "error") return
      if (!error || !isNetworkError(error)) return
      clearError()
      resumeStream()
    }
    document.addEventListener("visibilitychange", onVisibility)
    return () => document.removeEventListener("visibilitychange", onVisibility)
  }, [status, error, clearError, resumeStream])

  const handleStop = useCallback(() => {
    fetch(`/api/chat/${activeChatId}/stream`, { method: "DELETE" }).catch(() => {})
    stop()
  }, [stop, activeChatId])

  const ResendMessage = (messageId: string, model?: string, isAssistant?: boolean) => {
    let messageIndex = messages.findIndex((m) => m.id === messageId)

    if (isAssistant) messageIndex--

    const text = extractTextFromMessage(messages[messageIndex])
    if (text.length === 0 || text.trim() === "") return
    setMessages(messages.slice(0, messageIndex))

    sendMessage(
      { text: extractTextFromMessage(messages[messageIndex]) },
      { body: { model: model ?? selectedModel } }
    )
  }

  const SendEditMessage = (messageId: string, newText: string, files?: FileList) => {
    const messageIndex = messages.findIndex((m) => m.id === messageId)
    if (messageIndex === -1) return

    setMessages(messages.slice(0, messageIndex))

    sendMessage({ text: newText, files }, { body: { model: selectedModel } })
  }

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
        <div className="flex h-[100svh] flex-col items-center justify-center gap-6 bg-background mx-10">
          <h1 className="text-center text-4xl font-bold tracking-tight text-primary">AI Notes</h1>
          <p className="text-base text-muted-foreground">
            <T>Ask about your notes and general questions.</T>
          </p>
          <div className="flex w-full max-w-3xl sm:max-w-2xl min-h-[15svh] flex-col rounded-xl">
            <ChatInput
              onSendMessage={(text: string, files?: FileList) => {
                sendMessage(
                  { text, files },
                  {
                    body: {
                      id: backupChatId,
                      model: selectedModel
                    }
                  }
                )
                window.history.replaceState({}, "", `/chat/${backupChatId}`)
              }}
              isLoading={isLoadingFromSDK}
              onStopGeneration={handleStop}
            />
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="container mx-auto max-w-3xl flex-1 px-4 my-8 lg:px-8">
        <ChatMessages
          messages={messages}
          status={status}
          inputRef={inputRef}
          error={error || null}
          onEditMessage={SendEditMessage}
          onResendMessage={ResendMessage}
        />
      </div>
      <div
        className="container sticky bottom-0 z-10 mx-auto flex w-full max-w-3xl flex-col bg-background px-4 pb-2 lg:pb-5 lg:px-8"
        ref={inputRef}
        role="region"
        aria-label="Chat input"
      >
        <ChatInput
          onSendMessage={(text: string, files?: FileList) =>
            sendMessage({ text, files }, { body: { model: selectedModel } })
          }
          isLoading={isLoadingFromSDK}
          onStopGeneration={handleStop}
        />
      </div>
    </>
  )
}
