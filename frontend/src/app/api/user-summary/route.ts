import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { ErrorData } from "@/lib/types/api-types"
import { convex } from "@/lib/convex-server"
import { api } from "@convex/_generated/api"

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json<ErrorData>({ message: "Unauthorized" }, { status: 401 })
  }

  const summary = await convex.query(api.userSummaries.getUserSummary, { userId })
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

  await convex.mutation(api.userSummaries.upsertUserSummary, { userId, notesSummary })
  return NextResponse.json({ message: "Summary updated" })
}
