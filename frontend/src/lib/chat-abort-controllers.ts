import { addChannelListener, publishMessage } from "./redis"

function channel(chatId: string): string {
  return `chat-abort:${chatId}`
}

export async function publishAbort(chatId: string): Promise<void> {
  try {
    await publishMessage(channel(chatId), "stop")
  } catch {
    console.error(`[ABORT] Failed to publish stop for chat=${chatId}`)
  }
}

export function listenForAbort(chatId: string): {
  signal: AbortSignal
  cleanup: () => void
} {
  const controller = new AbortController()

  const cleanup = addChannelListener(channel(chatId), () => {
    controller.abort()
  })

  return { signal: controller.signal, cleanup }
}
