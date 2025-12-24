import { updateNote } from "@/db/db-functions"
import { ErrorData, UpdateNoteData } from "@/lib/types"
import { NextResponse } from "next/server"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const noteId = parseInt(id, 10)

  if (isNaN(noteId)) {
    return NextResponse.json<ErrorData>({ message: "Invalid note ID" }, { status: 400 })
  }

  const body = (await request.json()) as UpdateNoteData
  if (body.timestamp) {
    body.timestamp = new Date(body.timestamp)
  }

  try {
    await updateNote(noteId, body)
    return new NextResponse(null, { status: 201 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to update note"
    return NextResponse.json<ErrorData>({ message: errorMessage }, { status: 500 })
  }
}
