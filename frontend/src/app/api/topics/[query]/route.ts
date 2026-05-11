import { auth } from "@clerk/nextjs/server"
import { ErrorData } from "@/lib/types/api-types"
import { NextResponse } from "next/server"
import { convex } from "@/lib/convex-server"
import { api } from "@convex/_generated/api"
import { Id } from "@convex/_generated/dataModel"

export async function GET(request: Request, { params }: { params: Promise<{ query: string }> }) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json<ErrorData>({ message: "Unauthorized" }, { status: 401 })
  }
  const { query } = await params
  try {
    const { data, hasNext } = await convex.query(api.topics.searchTopics, { userId, query })
    return NextResponse.json({ data, hasNext })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to search topics"
    return NextResponse.json<ErrorData>({ message: errorMessage }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ query: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json<ErrorData>({ message: "Unauthorized" }, { status: 401 })
  }

  const { query: topicId } = await params
  try {
    const noteCount = await convex.query(api.notes.countNotesByTopicId, {
      userId,
      topicId: topicId as Id<"topics">
    })
    if (noteCount > 0) {
      return NextResponse.json<ErrorData>(
        { message: `Cannot delete topic: ${noteCount} note(s) are still associated with it` },
        { status: 400 }
      )
    }
    await convex.mutation(api.topics.deleteTopic, { userId, id: topicId as Id<"topics"> })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to delete topic"
    return NextResponse.json<ErrorData>({ message: errorMessage }, { status: 500 })
  }
}
