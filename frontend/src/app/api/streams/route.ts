import { auth } from "@clerk/nextjs/server"
import { getActiveStreams } from "@/db"

export const dynamic = "force-dynamic"

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return new Response("Unauthorized", { status: 401 })
  }

  const streams = await getActiveStreams(userId)

  return Response.json({
    streams: streams.map((s) => ({
      chatId: s.chatId,
      streamId: s.activeStreamId,
      title: s.title,
      updatedAt: s.updatedAt
    }))
  })
}
