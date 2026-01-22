import type { ChatUIMessage } from "@/lib/types/chat-types"
import { MessageBubble } from "./MessageBubble"
interface LastAssistantMessageProps {
  message: ChatUIMessage
  canShowButtons: boolean
  chatId: string
}

export function LastAssistantMessage({ message }: LastAssistantMessageProps) {
  return (
    <div className="flex flex-col">
      <MessageBubble message={message} onEditMessage={() => {}} />
    </div>
  )
}
