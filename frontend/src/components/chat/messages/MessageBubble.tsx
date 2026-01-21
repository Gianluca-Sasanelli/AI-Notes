import { useState } from "react"
import { Check, Copy } from "lucide-react"
import Image from "next/image"

import type { ChatUIMessage, ChatUIMessagePart } from "@/lib/types/chat-types"
import MessageReasoning from "./parts/messageReasoning"
import MessageUI from "./parts/messageText"
import ToolCallWidget from "./widgets/messageTool"
import { Button } from "@/components/ui/schadcn/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/schadcn/tooltip"
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
  const [copied, setCopied] = useState(false)

  return (
    <div
      className={`flex flex-col ${isUser ? "items-end" : "items-start"} gap-x-2`}
      ref={messageRef ?? undefined}
    >
      <div className={`group max-w-full`}>
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
            console.log("The name of the tool is", name)

            return (
              <div key={`${message.id}-${index}-${part.type}`} className="flex w-full ">
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
        <div className="flex mx-2 my-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <Tooltip delayDuration={500}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="!bg-transparent hover:!bg-transparent p-0"
                onClick={() => {
                  const text = message.parts
                    ?.filter((part) => part.type === "text")
                    .map((part) => part.text)
                    .join("\n")
                  if (text) {
                    navigator.clipboard.writeText(text)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 5000)
                  }
                }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="duration-1000">
              Copy message
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}
