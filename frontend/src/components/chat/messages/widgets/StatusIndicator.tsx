import { Avatar } from "@/components/ui/avatar"
import type { ChatUIMessage } from "@/lib/types/chat-types"
import type { ChatStatus } from "ai"
import { Bot } from "lucide-react"
import { useMemo } from "react"
export function RoutingIndicator() {
  return (
    <>
      <span className="mr-2 text-sm font-semibold">Routing to an agent</span>
      <span className="flex space-x-1">
        <span className="inline-block animate-bounce text-xl font-bold">.</span>
        <span className="inline-block animate-bounce text-xl font-bold delay-150">.</span>
        <span className="inline-block animate-bounce text-xl font-bold delay-300">.</span>
      </span>
    </>
  )
}

interface StatusIndicatorProps {
  lastAssistantMessage: ChatUIMessage | null
  chatStatus: ChatStatus
  error: Error | null
}
const IsChatStatusLoading = (
  chatStatus: ChatStatus,
  lastAssistantMessage: ChatUIMessage | null
) => {
  if (!lastAssistantMessage) return true
  if (chatStatus === "ready" || chatStatus === "error") {
    return false
  }
  const hasContent = lastAssistantMessage.parts.some(
    (part) => part.type === "text" && part.text !== ""
  )
  if (hasContent) {
    return false
  }

  return true
}

export function StatusIndicator({ lastAssistantMessage, chatStatus, error }: StatusIndicatorProps) {
  const latestDataStatus = useMemo(() => {
    if (!lastAssistantMessage) return null
    const dataStatus = lastAssistantMessage.parts.filter((part) => part.type === "data-ai-status")
    if (!Array.isArray(dataStatus) || dataStatus.length === 0 || !dataStatus) return null
    // @ts-expect-error - data is not defined on TextUIPart
    return dataStatus[dataStatus.length - 1].data
  }, [lastAssistantMessage])

  if (!IsChatStatusLoading(chatStatus, lastAssistantMessage)) return null
  if (error) return null
  return (
    <div className="flex h-[70px] animate-fade-in justify-start">
      <div className="flex items-start gap-3">
        <Avatar className="size-8 animate-pulse bg-secondary">
          <Bot className="m-auto size-5" />
        </Avatar>
        <div className="min-w-[120px] animate-pulse rounded-2xl rounded-tl-sm bg-secondary p-3 text-secondary-foreground shadow-md">
          <div className="flex items-center">
            {latestDataStatus ? (
              <span className="text-sm font-semibold">{latestDataStatus.frontend_message}</span>
            ) : (
              <RoutingIndicator />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
