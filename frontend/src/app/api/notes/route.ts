import { auth } from "@clerk/nextjs/server"
import { createNote, getNotes } from "@/db/db-functions"
import { ErrorData, NoteGranularity } from "@/lib/types/database-types"
import { NextResponse } from "next/server"
import type { NoteMetadata } from "@/db/schema"
import { logger, withTiming } from "@/lib/logger"

export async function GET(request: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json<ErrorData>({ message: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const skip = parseInt(searchParams.get("skip") || "0", 10)
  const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 50)
  const includeTotal = searchParams.get("total") === "true"

  logger.info("api", "GET /api/notes", { skip, limit, includeTotal })
  try {
    const result = await withTiming("api", "GET /api/notes", async () => {
      return getNotes(userId, skip, limit, includeTotal)
    })
    return NextResponse.json({
      data: result.data,
      skip,
      limit,
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

  const { startTimestamp, endTimestamp, granularity, content, metadata } =
    (await request.json()) as {
      startTimestamp: string
      endTimestamp?: string
      granularity?: NoteGranularity
      content: string
      metadata: NoteMetadata
    }

  logger.info("api", "POST /api/notes", { granularity, hasEndTimestamp: !!endTimestamp })
  try {
    const id = await withTiming("api", "POST /api/notes", async () => {
      return createNote(
        userId,
        content,
        new Date(startTimestamp),
        metadata,
        endTimestamp ? new Date(endTimestamp) : undefined,
        granularity
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
