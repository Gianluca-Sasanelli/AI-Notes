import { auth } from "@clerk/nextjs/server"
import { activeChatsChannel, getActiveChats } from "@/lib/active-chat-tracker"
import { addChannelListener } from "@/lib/redis"

export const dynamic = "force-dynamic"

export async function GET(): Promise<Response> {
  const { userId } = await auth()
  if (!userId) {
    return new Response("Unauthorized", { status: 401 })
  }

  const ch = activeChatsChannel(userId)
  const encoder = new TextEncoder()
  let keepalive: ReturnType<typeof setInterval> | null = null
  let cleanupSubscription: (() => void) | null = null

  const stream = new ReadableStream({
    async start(controller) {
      const initial = await getActiveChats(userId)
      controller.enqueue(
        encoder.encode(`event: active_chats\ndata: ${JSON.stringify(initial)}\n\n`)
      )

      cleanupSubscription = addChannelListener(ch, async () => {
        try {
          const current = await getActiveChats(userId)
          controller.enqueue(
            encoder.encode(`event: active_chats\ndata: ${JSON.stringify(current)}\n\n`)
          )
        } catch (error) {
          console.error("[ActiveStreams] Failed to read active chats", error)
        }
      })

      keepalive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keepalive\n\n"))
        } catch {
          // stream closed
        }
      }, 30_000)
    },

    cancel() {
      if (keepalive) clearInterval(keepalive)
      cleanupSubscription?.()
    }
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive"
    }
  })
}
