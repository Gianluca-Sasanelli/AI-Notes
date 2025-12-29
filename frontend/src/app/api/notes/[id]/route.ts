import { auth } from "@clerk/nextjs/server"
import { updateNote, deleteNote } from "@/db/db-functions"
import { ErrorData, UpdateNoteData } from "@/lib/types/database-types"
import { NextResponse } from "next/server"

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

  const body = (await request.json()) as UpdateNoteData
  if (body.startTimestamp) {
    body.startTimestamp = new Date(body.startTimestamp)
  }
  if (body.endTimestamp) {
    body.endTimestamp = new Date(body.endTimestamp)
  }

  try {
    await updateNote(userId, noteId, body)
    return new NextResponse(null, { status: 201 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to update note"
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

  try {
    await deleteNote(userId, noteId)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to delete note"
    return NextResponse.json<ErrorData>({ message: errorMessage }, { status: 500 })
  }
}
