import { auth } from "@clerk/nextjs/server"
import { UI_MESSAGE_STREAM_HEADERS } from "ai"
import { acquireResumeLock } from "@/lib/chat-stream-status"
import { publishAbort } from "@/lib/chat-abort-controllers"
import { getResumableStreamContext } from "@/lib/redis"

export const dynamic = "force-dynamic"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { id: chatId } = await params

  const locked = await acquireResumeLock(chatId)
  if (!locked) {
    return new Response(null, { status: 204 })
  }

  try {
    const streamContext = getResumableStreamContext()
    const stream = await streamContext.resumeExistingStream(chatId)

    if (!stream) {
      return new Response(null, { status: 204 })
    }

    return new Response(stream, {
      headers: UI_MESSAGE_STREAM_HEADERS
    })
  } catch {
    return new Response(null, { status: 204 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { id: chatId } = await params
  await publishAbort(chatId)
  return new Response(null, { status: 200 })
}
