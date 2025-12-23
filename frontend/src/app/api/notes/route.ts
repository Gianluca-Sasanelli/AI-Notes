import { createNote, getNotes } from "@/db/db-functions"
import { ErrorData } from "@/lib/types"
import { NextResponse } from "next/server"
import type { NoteMetadata } from "@/db/schema"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const skip = parseInt(searchParams.get("skip") || "0", 10)
  const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 50)
  const includeTotal = searchParams.get("total") === "true"
  try {
    const { data, hasNext, total } = await getNotes(skip, limit, includeTotal)
    return NextResponse.json({ data, skip, limit, hasNext, total })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch notes"
    return NextResponse.json<ErrorData>({ message: errorMessage }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const { timestamp, content, metadata } = (await request.json()) as {
    timestamp: string
    content: string
    metadata: NoteMetadata
  }
  try {
    const id = await createNote(content, new Date(timestamp), metadata)
    return NextResponse.json(
      { id },
      {
        status: 201,
        headers: { "created-id": String(id) }
      }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to create note"
    return NextResponse.json<ErrorData>({ message: errorMessage }, { status: 500 })
  }
}
