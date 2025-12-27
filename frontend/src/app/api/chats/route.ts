import { auth } from "@clerk/nextjs/server"
import { getChats } from "@/db/db-functions"
import { ErrorData } from "@/lib/types/database-types"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json<ErrorData>({ message: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const skip = parseInt(searchParams.get("skip") || "0", 10)
  const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 50)
  try {
    const { data, hasNext } = await getChats(userId, skip, limit)
    return NextResponse.json({ data, skip, limit, hasNext })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch chats"
    return NextResponse.json<ErrorData>({ message: errorMessage }, { status: 500 })
  }
}
