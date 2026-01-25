import { auth } from "@clerk/nextjs/server"
import { ErrorData } from "@/lib/types/api-types"
import { NextResponse } from "next/server"
import { searchTopics, deleteTopic } from "@/db/db-topic"
import { countNotesByTopicId } from "@/db/db-notes"

export async function GET(request: Request, { params }: { params: Promise<{ query: string }> }) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json<ErrorData>({ message: "Unauthorized" }, { status: 401 })
  }
  const { query } = await params
  try {
    const { data, hasNext } = await searchTopics(userId, query)
    return NextResponse.json({ data, hasNext })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to search topics"
    return NextResponse.json<ErrorData>({ message: errorMessage }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ query: string }> }) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json<ErrorData>({ message: "Unauthorized" }, { status: 401 })
  }

  const { query } = await params
  const topicId = parseInt(query, 10)

  if (isNaN(topicId)) {
    return NextResponse.json<ErrorData>({ message: "Invalid topic ID" }, { status: 400 })
  }

  try {
    const noteCount = await countNotesByTopicId(userId, topicId)
    if (noteCount > 0) {
      return NextResponse.json<ErrorData>(
        { message: `Cannot delete topic: ${noteCount} note(s) are still associated with it` },
        { status: 400 }
      )
    }
    await deleteTopic(userId, topicId)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to delete topic"
    return NextResponse.json<ErrorData>({ message: errorMessage }, { status: 500 })
  }
}
