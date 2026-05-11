import { auth } from "@clerk/nextjs/server"
import { ErrorData, UpdateNoteBody } from "@/lib/types/api-types"
import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"
import { handleTopicCreationOrUpdateOrRemoval } from "@/lib/route-functions/topic-creation"
import { convex } from "@/lib/convex-server"
import { api } from "@convex/_generated/api"
import { Id } from "@convex/_generated/dataModel"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json<ErrorData>({ message: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  logger.info("api", `GET /api/notes/${id}`)
  try {
    const note = await convex.query(api.notes.getNote, { userId, id: id as Id<"notes"> })
    if (!note) {
      return NextResponse.json<ErrorData>({ message: "Note not found" }, { status: 404 })
    }
    return NextResponse.json({
      ...note,
      files: note.files.map((f) => f.filename)
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch note"
    logger.error("api", `GET /api/notes/${id} failed`, { error: errorMessage })
    return NextResponse.json<ErrorData>({ message: errorMessage }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json<ErrorData>({ message: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = (await request.json()) as UpdateNoteBody

  logger.info("api", `PATCH /api/notes/${id}`)
  try {
    const topicId = await handleTopicCreationOrUpdateOrRemoval(userId, body.topic)

    await convex.mutation(api.notes.updateNote, {
      userId,
      id: id as Id<"notes">,
      ...(body.content !== undefined ? { content: body.content } : {}),
      ...(body.startTimestamp !== undefined
        ? { startTimestamp: body.startTimestamp ? new Date(body.startTimestamp).getTime() : null }
        : {}),
      ...(body.endTimestamp !== undefined
        ? { endTimestamp: body.endTimestamp ? new Date(body.endTimestamp).getTime() : null }
        : {}),
      ...(body.granularity !== undefined ? { granularity: body.granularity ?? null } : {}),
      ...(topicId !== undefined ? { topicId: (topicId ?? null) as Id<"topics"> | null } : {})
    })

    return new NextResponse(null, { status: 201 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to update note"
    logger.error("api", `PATCH /api/notes/${id} failed`, { error: errorMessage })
    return NextResponse.json<ErrorData>({ message: errorMessage }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json<ErrorData>({ message: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  logger.info("api", `DELETE /api/notes/${id}`)
  try {
    await convex.mutation(api.notes.deleteNote, { userId, id: id as Id<"notes"> })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to delete note"
    logger.error("api", `DELETE /api/notes/${id} failed`, { error: errorMessage })
    return NextResponse.json<ErrorData>({ message: errorMessage }, { status: 500 })
  }
}
