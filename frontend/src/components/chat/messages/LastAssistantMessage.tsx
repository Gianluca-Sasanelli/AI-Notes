import type { ChatUIMessage } from "@/lib/types/chat-types"
import { MessageBubble } from "./MessageBubble"
interface LastAssistantMessageProps {
  message: ChatUIMessage
  onResendMessage: (messageId: string, model?: string, isAssistant?: boolean) => void
}

export function LastAssistantMessage({ message, onResendMessage }: LastAssistantMessageProps) {
  return (
    <div className="flex flex-col">
      <MessageBubble message={message} onEditMessage={() => {}} onResendMessage={onResendMessage} />
    </div>
  )
}
