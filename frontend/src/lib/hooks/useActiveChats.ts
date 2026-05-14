import { useSyncExternalStore } from "react"

let eventSource: EventSource | null = null
let activeChats: Set<string> = new Set()
const listeners = new Set<() => void>()

function notifyListeners() {
  listeners.forEach((listener) => listener())
}

function connect() {
  if (eventSource) return

  eventSource = new EventSource("/api/chat/active-streams")

  eventSource.addEventListener("active_chats", (e: MessageEvent) => {
    try {
      const ids = JSON.parse(e.data) as string[]
      activeChats = new Set(ids)
      notifyListeners()
    } catch (error) {
      console.error("[useActiveChats] Error parsing active chats", error)
    }
  })

  eventSource.onerror = () => {
    console.warn("[useActiveChats] SSE connection error, will auto-reconnect")
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return activeChats
}

function getServerSnapshot() {
  return new Set<string>()
}

export function useActiveChats(): { activeChats: Set<string> } {
  connect()

  const currentActiveChats = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  return { activeChats: currentActiveChats }
}
