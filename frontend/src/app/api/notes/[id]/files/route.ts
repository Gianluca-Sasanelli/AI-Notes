import { auth } from "@clerk/nextjs/server"
import { ErrorData } from "@/lib/types/database-types"
import { NextResponse } from "next/server"
import { logger, withTiming } from "@/lib/logger"
import { uploadFile, deleteFile, getFileUrl, sanitizeFilename } from "@/lib/storage"
import { addFileToNote, removeFileFromNote, getNoteFiles } from "@/db/db-functions"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json<ErrorData>({ message: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const noteId = parseInt(id, 10)

  if (isNaN(noteId)) {
    return NextResponse.json<ErrorData>({ message: "Invalid note ID" }, { status: 400 })
  }

  const formData = await request.formData()
  const file = formData.get("file") as File | null
  const customFilename = formData.get("filename") as string | null

  if (!file) {
    return NextResponse.json<ErrorData>({ message: "No file provided" }, { status: 400 })
  }

  const filename = sanitizeFilename(customFilename || file.name)
  logger.info("api", `POST /api/notes/${noteId}/files`, {
    original: file.name,
    custom: customFilename,
    filename
  })
  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    await withTiming("api", `POST /api/notes/${noteId}/files`, async () => {
      await uploadFile(userId, noteId, filename, buffer, file.type)
      await addFileToNote(userId, noteId, filename)
    })
    return NextResponse.json({ filename }, { status: 201 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to upload file"
    logger.error("api", `POST /api/notes/${noteId}/files failed`, { error: errorMessage })
    return NextResponse.json<ErrorData>({ message: errorMessage }, { status: 500 })
  }
}

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

  const { searchParams } = new URL(request.url)
  const filename = searchParams.get("filename")

  if (filename) {
    logger.info("api", `GET /api/notes/${noteId}/files`, { filename })
    try {
      const url = await getFileUrl(userId, noteId, filename)
      return NextResponse.json({ url })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to get file URL"
      logger.error("api", `GET /api/notes/${noteId}/files failed`, { error: errorMessage })
      return NextResponse.json<ErrorData>({ message: errorMessage }, { status: 500 })
    }
  }

  logger.info("api", `GET /api/notes/${noteId}/files (list)`)
  try {
    const files = await getNoteFiles(userId, noteId)
    return NextResponse.json({ files })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to list files"
    logger.error("api", `GET /api/notes/${noteId}/files failed`, { error: errorMessage })
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

  const { searchParams } = new URL(request.url)
  const filename = searchParams.get("filename")

  if (!filename) {
    return NextResponse.json<ErrorData>({ message: "Filename required" }, { status: 400 })
  }

  logger.info("api", `DELETE /api/notes/${noteId}/files`, { filename })
  try {
    await withTiming("api", `DELETE /api/notes/${noteId}/files`, async () => {
      await deleteFile(userId, noteId, filename)
      await removeFileFromNote(userId, noteId, filename)
    })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to delete file"
    logger.error("api", `DELETE /api/notes/${noteId}/files failed`, { error: errorMessage })
    return NextResponse.json<ErrorData>({ message: errorMessage }, { status: 500 })
  }
}
