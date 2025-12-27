import { auth } from "@clerk/nextjs/server"
import { updateChatTitle, deleteChat } from "@/db/db-functions"
import { ErrorData } from "@/lib/types/database-types"
import { NextResponse } from "next/server"

export async function PATCH(request: Request, { params }: { params: Promise<{ chatId: string }> }) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json<ErrorData>({ message: "Unauthorized" }, { status: 401 })
  }

  const { chatId } = await params
  try {
    const { title } = await request.json()
    await updateChatTitle(userId, chatId, title)
    return NextResponse.json({ success: true })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to update chat"
    return NextResponse.json<ErrorData>({ message: errorMessage }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json<ErrorData>({ message: "Unauthorized" }, { status: 401 })
  }

  const { chatId } = await params
  try {
    await deleteChat(userId, chatId)
    return NextResponse.json({ success: true })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to delete chat"
    return NextResponse.json<ErrorData>({ message: errorMessage }, { status: 500 })
  }
}
