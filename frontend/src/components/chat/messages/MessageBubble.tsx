import { useState } from "react"
import { Check, Copy, Pencil, X } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import type { ChatUIMessage, ChatUIMessagePart, chatContext } from "@/lib/types/chat-types"
import MessageReasoning from "./parts/messageReasoning"
import MessageUI from "./parts/messageText"
import ToolCallWidget from "./widgets/messageTool"
import { Button } from "@/components/ui/schadcn/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/schadcn/tooltip"
import ChatInput from "@/components/chat/ChatInput"

interface MessageBubbleProps {
  message: ChatUIMessage
  messageRef?: React.RefObject<HTMLDivElement | null>
  onEditMessage?: (
    messageId: string,
    newText: string,
    files?: FileList,
    context?: chatContext | null
  ) => void
}
type ToolTypes<T> = T extends `tool-${string}` ? T : never
type ToolPartTypes = ToolTypes<ChatUIMessagePart["type"]>

function isToolPart(part: ChatUIMessagePart): part is ChatUIMessagePart & { type: ToolPartTypes } {
  return part.type.startsWith("tool")
}
export function MessageBubble(props: MessageBubbleProps) {
  const { message, messageRef, onEditMessage } = props
  const isUser = message.role === "user"
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const IsEditingBoundary = isEditing && onEditMessage !== undefined
  const canEdit = isUser && onEditMessage !== undefined
  return (
    <div
      className={`flex flex-col ${isUser ? "items-end" : "items-start"} pt-2`}
      ref={messageRef ?? undefined}
    >
      <div
        className={`flex flex-col group  ${isUser ? "max-w-full" : "gap-6 w-full"} ${isEditing ? "w-full" : ""}`}
      >
        {IsEditingBoundary ? (
          <div className="w-full">
            <ChatInput
              onSendMessage={(text: string, files?: FileList, context?: chatContext) => {
                onEditMessage(message.id, text, files, context || null)
                setIsEditing(false)
              }}
              isLoading={false}
              onStopGeneration={() => {}}
              startingInput={message.parts
                ?.filter((part) => part.type === "text" && "text" in part)
                .map((part) => (part.type === "text" ? part.text : ""))
                .join("\n")}
            />
          </div>
        ) : (
          <>
            {message?.parts?.map((part, index) => {
              if (part.type === "text") {
                return (
                  <MessageUI key={`${message.id}-${index}`} message={part.text} isUser={isUser} />
                )
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
                  <div
                    key={`${message.id}-${index}-${part.type}`}
                    className="flex w-full justify-center "
                  >
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
              return null
            })}
          </>
        )}

        <div
          className={`flex my-1 opacity-0 ${isUser ? "justify-end gap-4" : ""} group-hover:opacity-100 transition-opacity duration-500`}
        >
          {canEdit && (
            <Tooltip delayDuration={500} disableHoverableContent={true}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="!bg-transparent hover:!bg-transparent !p-0 !m-0"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="duration-1000">
                Edit message
              </TooltipContent>
            </Tooltip>
          )}
          <Tooltip delayDuration={500} disableHoverableContent={true}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="!bg-transparent hover:!bg-transparent !p-0 !m-0"
                onClick={() => {
                  const text = message.parts
                    ?.filter((part) => part.type === "text" && "text" in part)
                    .map((part) => (part.type === "text" ? part.text : ""))
                    .join("\n")
                  if (text) {
                    navigator.clipboard.writeText(text)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 5000)
                    toast.success("Copied to clipboard", { position: "top-center", duration: 2000 })
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
