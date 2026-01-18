import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { getUserSummary, upsertUserSummary } from "@/db"
import { ErrorData } from "@/lib/types/api-types"

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json<ErrorData>({ message: "Unauthorized" }, { status: 401 })
  }

  const summary = await getUserSummary(userId)
  return NextResponse.json({ summary })
}

export async function PUT(request: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json<ErrorData>({ message: "Unauthorized" }, { status: 401 })
  }

  const { notesSummary } = await request.json()
  if (typeof notesSummary !== "string") {
    return NextResponse.json<ErrorData>({ message: "Invalid summary" }, { status: 400 })
  }

  await upsertUserSummary(userId, notesSummary)
  return NextResponse.json({ message: "Summary updated" })
}
