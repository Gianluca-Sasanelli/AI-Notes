import type { ChatUIMessage } from "@/lib/types/chat-types"
import Image from "next/image"

import MessageReasoning from "./parts/messageReasoning"
import MessageUI from "./parts/messageText"

interface MessageBubbleProps {
  message: ChatUIMessage
  messageRef?: React.RefObject<HTMLDivElement | null>
}

export function MessageBubble(props: MessageBubbleProps) {
  const { message, messageRef } = props
  const isUser = message.role === "user"

  return (
    <div
      className={`flex flex-col ${isUser ? "items-end" : "items-start"} gap-x-2`}
      ref={messageRef ?? undefined}
      data-testid={isUser ? "user-message" : "assistant-message"}
    >
      {message?.parts?.map((part, index) => {
        if (part.type === "text") {
          return <MessageUI key={`${message.id}-${index}`} message={part.text} isUser={isUser} />
        }

        if (part.type === "file" && part.mediaType?.startsWith("image/")) {
          return (
            <div
              key={`${message.id}-${index}-${part.type}`}
              className="relative overflow-hidden rounded border"
            >
              <Image
                src={part.url}
                alt={part.filename ?? `attachment-${index}`}
                width={100}
                height={100}
                className="object-cover"
              />
            </div>
          )
        }
        if (part.type === "reasoning") {
          return (
            <div key={`${message.id}-${index}-${part.type}`}>
              <MessageReasoning part={part} />
            </div>
          )
        }
      })}
    </div>
  )
}
