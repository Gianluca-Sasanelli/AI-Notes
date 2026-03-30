import { UI_MESSAGE_STREAM_HEADERS } from "ai"
import { auth } from "@clerk/nextjs/server"
import { getActiveStreamId } from "@/db"
import { getStreamContext } from "@/lib/resumable-stream"

export const dynamic = "force-dynamic"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { id: chatId } = await params

  const activeStreamId = await getActiveStreamId(userId, chatId)

  if (!activeStreamId) {
    return new Response(null, { status: 204 })
  }

  const streamContext = getStreamContext()
  const stream = await streamContext.resumeExistingStream(activeStreamId)

  if (!stream) {
    return new Response(null, { status: 204 })
  }

  return new Response(stream, {
    headers: UI_MESSAGE_STREAM_HEADERS
  })
}
