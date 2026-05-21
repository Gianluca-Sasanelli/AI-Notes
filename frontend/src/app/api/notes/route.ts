import { auth } from "@clerk/nextjs/server"
import { ErrorData, CreateNoteBody } from "@/lib/types/api-types"
import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"
import { handleTopicCreationOrUpdateOrRemoval } from "@/lib/route-functions/topic-creation"
import { convex } from "@/lib/convex-server"
import { api } from "@convex/_generated/api"
import { Id } from "@convex/_generated/dataModel"

const flattenFiles = (notes: { files: { filename: string }[] }[]) =>
  notes.map((n) => ({ ...n, files: n.files.map((f) => f.filename) }))

export async function GET(request: Request) {
  const { userId } = (await auth()) as { userId: string }
  const { searchParams } = new URL(request.url)

  try {
    const from = searchParams.get("from")
    const to = searchParams.get("to")
    if (from && to) {
      const notes = await convex.query(api.notes.getTimeNotesByDateRange, {
        userId,
        from: parseInt(from, 10),
        to: parseInt(to, 10)
      })
      return NextResponse.json({ data: flattenFiles(notes) })
    }

    const timeless = searchParams.get("timeless") === "true"
    const skip = parseInt(searchParams.get("skip") || "0", 10)
    const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 50)
    const includeTotal = searchParams.get("total") === "true"
    const topicId = (searchParams.get("topicId") || undefined) as Id<"topics"> | undefined

    const result = timeless
      ? await convex.query(api.notes.getTimelessNotes, { userId, skip, limit, includeTotal })
      : await convex.query(api.notes.getTimeNotes, { userId, skip, limit, includeTotal, topicId })

    return NextResponse.json({
      data: flattenFiles(result.data),
      hasNext: result.hasNext,
      total: result.total
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch notes"
    logger.error("api", "GET /api/notes failed", { error: errorMessage })
    return NextResponse.json<ErrorData>({ message: errorMessage }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const { userId } = (await auth()) as { userId: string }

  const body = (await request.json()) as CreateNoteBody

  logger.info("api", "POST /api/notes", { timeless: body.timeless })
  try {
    const topicId = await handleTopicCreationOrUpdateOrRemoval(userId, body.topic)

    const id = await convex.mutation(api.notes.createNote, {
      userId,
      content: body.content,
      startTimestamp: body.timeless ? undefined : new Date(body.startTimestamp).getTime(),
      endTimestamp:
        body.timeless || !body.endTimestamp ? undefined : new Date(body.endTimestamp).getTime(),
      granularity: body.timeless ? undefined : (body.granularity ?? undefined),
      topicId: (topicId ?? undefined) as Id<"topics"> | undefined
    })

    return NextResponse.json({ _id: id }, { status: 201, headers: { "created-id": String(id) } })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to create note"
    logger.error("api", "POST /api/notes failed", { error: errorMessage })
    return NextResponse.json<ErrorData>({ message: errorMessage }, { status: 500 })
  }
}
