import { useState } from "react"
import { Check, Copy, Pencil, PencilOff, RotateCcw } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import {
  extractTextFromMessage,
  type ChatUIMessage,
  type ChatUIMessagePart,
  type chatContext
} from "@/lib/types/chat-types"
import MessageReasoning from "./parts/messageReasoning"
import MessageUI from "./parts/messageText"
import ToolCallWidget from "./widgets/messageTool"
import { Button } from "@/components/ui/schadcn/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/schadcn/tooltip"
import ChatInput from "@/components/chat/ChatInput"

interface MessageBubbleProps {
  message: ChatUIMessage
  messageRef?: React.RefObject<HTMLDivElement | null>
  onResendMessage: (messageId: string, selectedModel?: string, isAssistant?: boolean) => void
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
  const { message, messageRef, onEditMessage, onResendMessage } = props
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
          <div className="w-full transition-all transition-duration-300 ">
            <ChatInput
              onSendMessage={(text: string, files?: FileList, context?: chatContext) => {
                onEditMessage(message.id, text, files, context || null)
                setIsEditing(false)
              }}
              isLoading={false}
              onStopGeneration={() => {}}
              autoFocus
              startingInput={extractTextFromMessage(message)}
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
          className={`flex my-1 opacity-0 ${isUser ? "justify-end" : ""} group-hover:opacity-100 transition-opacity duration-300 gap-4`}
        >
          <Tooltip delayDuration={500} disableHoverableContent={true}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="!bg-transparent hover:!bg-transparent !p-0 !m-0"
                disabled={isEditing}
                onClick={() => onResendMessage(message.id, undefined, !isUser)}
              >
                <RotateCcw size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="duration-1000">
              Resend message
            </TooltipContent>
          </Tooltip>
          {canEdit && (
            <Tooltip delayDuration={500} disableHoverableContent={true}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="!bg-transparent hover:!bg-transparent !p-0 !m-0"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? <PencilOff size={16} /> : <Pencil size={16} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="duration-1000">
                {isEditing ? "Cancel edit" : "Edit message"}
              </TooltipContent>
            </Tooltip>
          )}
          <Tooltip delayDuration={500} disableHoverableContent={true}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="!bg-transparent hover:!bg-transparent !p-0 !m-0"
                disabled={isEditing}
                onClick={() => {
                  const text = extractTextFromMessage(message)
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
