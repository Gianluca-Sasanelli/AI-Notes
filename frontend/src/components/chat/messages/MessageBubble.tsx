import type { ChatUIMessage, ChatUIMessagePart } from "@/lib/types/chat-types"
import Image from "next/image"

import MessageReasoning from "./parts/messageReasoning"
import MessageUI from "./parts/messageText"
import ToolCallWidget from "./widgets/messageTool"
interface MessageBubbleProps {
  message: ChatUIMessage
  messageRef?: React.RefObject<HTMLDivElement | null>
}
type ToolTypes<T> = T extends `tool-${string}` ? T : never
type ToolPartTypes = ToolTypes<ChatUIMessagePart["type"]>

function isToolPart(part: ChatUIMessagePart): part is ChatUIMessagePart & { type: ToolPartTypes } {
  return part.type.startsWith("tool")
}
export function MessageBubble(props: MessageBubbleProps) {
  const { message, messageRef } = props
  const isUser = message.role === "user"

  return (
    <div
      className={`flex flex-col ${isUser ? "items-end" : "items-start"} gap-x-2`}
      ref={messageRef ?? undefined}
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
        if (isToolPart(part)) {
          const name = part.type.split("-")[1]
          return (
            <div key={`${message.id}-${index}-${part.type}`} className="flex w-full justify-center">
              <ToolCallWidget
                toolName={name}
                state={
                  part.state as
                    | "input-streaming"
                    | "input-available"
                    | "output-available"
                    | "output-error"
                }
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
