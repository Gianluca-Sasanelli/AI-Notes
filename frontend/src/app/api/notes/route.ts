import { auth } from "@clerk/nextjs/server"
import { createNote, getTimeNotes, getTimelessNotes } from "@/db"
import { ErrorData, NoteGranularity } from "@/lib/types/database-types"
import { NextResponse } from "next/server"
import type { NoteMetadata } from "@/db/schema"
import { logger, withTiming } from "@/lib/logger"

type TimeNoteBody = {
  timeless: false
  startTimestamp: string
  endTimestamp?: string
  granularity: NoteGranularity
  content: string
  metadata: NoteMetadata
}

type TimelessNoteBody = {
  timeless: true
  content: string
  metadata: NoteMetadata
}

type CreateNoteBody = TimeNoteBody | TimelessNoteBody

export async function GET(request: Request) {
  console.log("Test log")
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json<ErrorData>({ message: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const skip = parseInt(searchParams.get("skip") || "0", 10)
  const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 50)
  const includeTotal = searchParams.get("total") === "true"
  const timeless = searchParams.get("timeless") === "true"

  logger.info("api", "GET /api/notes", { skip, limit, includeTotal, timeless })
  try {
    const result = await withTiming("api", "GET /api/notes", async () => {
      return timeless
        ? getTimelessNotes(userId, skip, limit, includeTotal)
        : getTimeNotes(userId, skip, limit, includeTotal)
    })
    return NextResponse.json({
      data: result.data,
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
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json<ErrorData>({ message: "Unauthorized" }, { status: 401 })
  }

  const body = (await request.json()) as CreateNoteBody

  logger.info("api", "POST /api/notes", { timeless: body.timeless })
  try {
    const id = await withTiming("api", "POST /api/notes", async () => {
      if (body.timeless) {
        return createNote(userId, body.content, body.metadata, null, null, null)
      }
      return createNote(
        userId,
        body.content,
        body.metadata,
        new Date(body.startTimestamp),
        body.endTimestamp ? new Date(body.endTimestamp) : null,
        body.granularity
      )
    })
    return NextResponse.json(
      { id },
      {
        status: 201,
        headers: { "created-id": String(id) }
      }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to create note"
    logger.error("api", "POST /api/notes failed", { error: errorMessage })
    return NextResponse.json<ErrorData>({ message: errorMessage }, { status: 500 })
  }
}
