import { auth } from "@clerk/nextjs/server"
import { getNote, updateNote, deleteNote } from "@/db"
import { ErrorData, UpdateNoteBody } from "@/lib/types/database-types"
import { NextResponse } from "next/server"
import { logger, withTiming } from "@/lib/logger"
import { createTopic } from "@/db/db-topic"
import { updateTopic } from "@/db/db-topic"
import { TopicDbData } from "@/lib/types/database-types"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json<ErrorData>({ message: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const noteId = parseInt(id, 10)

  if (isNaN(noteId)) {
    return NextResponse.json<ErrorData>({ message: "Invalid note ID" }, { status: 400 })
  }

  logger.info("api", `GET /api/notes/${noteId}`)
  try {
    const note = await withTiming("api", `GET /api/notes/${noteId}`, async () => {
      return getNote(userId, noteId)
    })
    if (!note) {
      return NextResponse.json<ErrorData>({ message: "Note not found" }, { status: 404 })
    }
    return NextResponse.json(note)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch note"
    logger.error("api", `GET /api/notes/${noteId} failed`, { error: errorMessage })
    return NextResponse.json<ErrorData>({ message: errorMessage }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json<ErrorData>({ message: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const noteId = parseInt(id, 10)

  if (isNaN(noteId)) {
    return NextResponse.json<ErrorData>({ message: "Invalid note ID" }, { status: 400 })
  }

  const body = (await request.json()) as UpdateNoteBody
  if (body.startTimestamp) {
    body.startTimestamp = new Date(body.startTimestamp)
  }
  if (body.endTimestamp) {
    body.endTimestamp = new Date(body.endTimestamp)
  }
  const createdId = await handleTopicOnPatch(userId, body.topic)
  logger.info("api", `PATCH /api/notes/${noteId}`)
  try {
    await withTiming("api", `PATCH /api/notes/${noteId}`, async () => {
      await updateNote(userId, noteId, { ...body, topicId: createdId })
    })
    return new NextResponse(null, { status: 201 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to update note"
    logger.error("api", `PATCH /api/notes/${noteId} failed`, { error: errorMessage })
    return NextResponse.json<ErrorData>({ message: errorMessage }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json<ErrorData>({ message: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const noteId = parseInt(id, 10)

  if (isNaN(noteId)) {
    return NextResponse.json<ErrorData>({ message: "Invalid note ID" }, { status: 400 })
  }

  logger.info("api", `DELETE /api/notes/${noteId}`)
  try {
    await withTiming("api", `DELETE /api/notes/${noteId}`, async () => {
      await deleteNote(userId, noteId)
    })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to delete note"
    logger.error("api", `DELETE /api/notes/${noteId} failed`, { error: errorMessage })
    return NextResponse.json<ErrorData>({ message: errorMessage }, { status: 500 })
  }
}

async function handleTopicOnPatch(
  userId: string,
  topicEntry: { [id: number]: TopicDbData } | { new: TopicDbData } | undefined
) {
  let output: number | undefined = undefined
  if (!topicEntry) {
    return output
  }
  if ("new" in topicEntry) {
    output = await createTopic(userId, topicEntry.new)
  } else {
    for (const [id, data] of Object.entries(topicEntry)) {
      try {
        await updateTopic(userId, parseInt(id, 10), data)
      } catch (error) {
        logger.error(
          "api",
          `Failed to update topic with id ${id}: ${error instanceof Error ? error.message : String(error)}`
        )
        throw new Error("An error occurred while processing the topic update.")
      }
    }
  }
  return output
}
