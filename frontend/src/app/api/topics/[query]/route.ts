import { auth } from "@clerk/nextjs/server"
import { ErrorData } from "@/lib/types/api-types"
import { NextResponse } from "next/server"
import { searchTopics } from "@/db/db-topic"

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
