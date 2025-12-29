import type { CreateUIMessage, UIMessage } from "@ai-sdk/react"
import type { ChatRequestOptions } from "ai"
import type { Dispatch, SetStateAction } from "react"
import { useEffect, useState } from "react"

const MOBILE_BREAKPOINT = 768
export interface UseSendMessageProps {
  sendMessage: (
    message: UIMessage | CreateUIMessage<UIMessage>,
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>
  isLoading: boolean
}
export const handleGlobalKeyDown = (
  e: KeyboardEvent,
  setState: Dispatch<SetStateAction<string>>,
  inputRef: React.RefObject<HTMLTextAreaElement | null>
) => {
  const target = e.target as HTMLElement | null
  if (target) {
    const tag = target.tagName
    const isEditable =
      tag === "INPUT" || tag === "TEXTAREA" || target.getAttribute("contenteditable") === "true"
    if (isEditable || inputRef.current == null) return
  }

  if (e.ctrlKey || e.metaKey || e.altKey) return
  const isLetter = e.key.length === 1 && /^[a-zA-Z0-9]$/.test(e.key)
  if (!isLetter) return

  e.preventDefault()
  inputRef.current?.focus()
  setState((prev: string) => prev + e.key)
}

const threeMessageGap = 32 * 3
/**
 * @param assistantLastMsgRef Ref to the last assistant message
 * @param userLastMsgRef Ref to the last user message
 * @param inputRef Ref to the input element
 * @param ChatMessagesRef Ref to the chat messages container
 * @param status The status of the chat
 *
 * To scroll the user message to the top of the viewport we need to add a placeholder below.
 * The placeholder must be of the right height to  cover all the available viewport (so viewport height - user message - assistant message component).
 * The assistant message component contains the status indicator and when the model starts streaming we print the assistant message content instead.
 * On submit we scroll to the user message on top.
 */
export default function usePlaceholderUpdater(
  assistantLastMsgRef: React.RefObject<HTMLDivElement | null>,
  userLastMsgRef: React.RefObject<HTMLDivElement | null>,
  inputRef: React.RefObject<HTMLDivElement | null>,
  ChatMessagesRef: React.RefObject<HTMLDivElement | null>,
  status: string
) {
  useEffect(() => {
    const assistantEl = assistantLastMsgRef.current

    if (!assistantEl) {
      return
    }

    const updatePlaceholder = () => {
      const assistantHeight = assistantEl.getBoundingClientRect().height

      const userHeight = userLastMsgRef.current?.getBoundingClientRect().height ?? 0

      const inputHeight = inputRef.current?.getBoundingClientRect().height ?? 0
      const totalMessageHeight = assistantHeight + userHeight + threeMessageGap
      const availableHeight = window.innerHeight - totalMessageHeight - inputHeight

      const newHeightPx = Math.max(availableHeight, 0)

      if (ChatMessagesRef.current) {
        ChatMessagesRef.current.style.height = `${newHeightPx}px`
      }
    }
    const observer = new ResizeObserver(() => updatePlaceholder())

    updatePlaceholder()

    observer.observe(assistantEl)

    return () => {
      observer.disconnect()
    }
  }, [assistantLastMsgRef, userLastMsgRef, inputRef, ChatMessagesRef])

  useEffect(() => {
    if (status === "submitted" && ChatMessagesRef.current) {
      setTimeout(() => {
        if (!ChatMessagesRef.current) return
        ChatMessagesRef.current.scrollIntoView({
          behavior: "smooth"
        })
      })
    }
  }, [status, ChatMessagesRef])
}
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(false)

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

    const onChange = () => setIsMobile(mql.matches)

    onChange()
    mql.addEventListener("change", onChange)

    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile
}
