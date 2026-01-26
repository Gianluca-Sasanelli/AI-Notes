import type { AgentStatusData, ChatUIMessage } from "@/lib/types/chat-types"
import type { ChatStatus, DataUIPart } from "ai"
import { useMemo } from "react"


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
    const dataStatus = lastAssistantMessage.parts.filter(
      (part): part is DataUIPart<AgentStatusData> => part.type === "data-ai-status"
    )
    if (dataStatus.length === 0) return null
    return dataStatus[dataStatus.length - 1].data
  }, [lastAssistantMessage])

  if (!IsChatStatusLoading(chatStatus, lastAssistantMessage)) return null
  if (error) return null
  return (
    <div className="flex h-[70px] animate-fade-in justify-start">
      <div className="flex items-start gap-3">
        <div className="min-w-[120px] animate-pulse rounded-2xl rounded-tl-sm bg-secondary p-3 text-secondary-foreground shadow-md">
          <div className="flex items-center">
            {latestDataStatus ? (
              <span className="text-sm font-semibold">{latestDataStatus.frontend_message}</span>
            ) : (
              <span className="text-sm font-semibold">Sending</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
