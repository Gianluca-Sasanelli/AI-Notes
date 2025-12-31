import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { db } from "@/index"
import { notes, userSummaries } from "@/db/schema"
import { generateText } from "ai"
import { GOOGLE_MODEL, getModelInstance } from "@/lib/agents/models"
import { buildUserNotesSummaryPrompt } from "@/lib/agents/system-prompts/prompts"
import { ErrorData } from "@/lib/types/database-types"
import { eq, and, gt, desc, sql } from "drizzle-orm"

export async function POST() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json<ErrorData>({ message: "Unauthorized" }, { status: 401 })
  }

  const [existingSummary] = await db
    .select()
    .from(userSummaries)
    .where(eq(userSummaries.userId, userId))
    .limit(1)

  const notesQuery = db
    .select({
      id: notes.id,
      content: notes.content,
      startTimestamp: notes.startTimestamp,
      updatedAt: notes.updatedAt
    })
    .from(notes)
    .where(
      existingSummary
        ? and(eq(notes.userId, userId), gt(notes.updatedAt, existingSummary.updatedAt))
        : eq(notes.userId, userId)
    )
    .orderBy(desc(sql`COALESCE(${notes.endTimestamp}, ${notes.startTimestamp})`))
    .limit(10)

  const latestNotes = await notesQuery

  if (!existingSummary && latestNotes.length < 5) {
    return NextResponse.json<ErrorData>(
      { message: "Not enough notes. Notes count: " + latestNotes.length },
      { status: 400 }
    )
  }

  if (existingSummary && latestNotes.length === 0) {
    return NextResponse.json({
      message: "No new notes since last summary",
      summary: existingSummary.notesSummary
    })
  }

  const notesText = latestNotes
    .map((n, i) => `Note ${i + 1} (${n.startTimestamp.toISOString()}):\n${n.content}`)
    .join("\n\n")

  const prompt = buildUserNotesSummaryPrompt(
    existingSummary?.notesSummary ?? "No summary yet available. This is the first summary.",
    existingSummary?.updatedAt.toISOString() ?? "N/A",
    latestNotes[latestNotes.length - 1]?.updatedAt.toISOString() ?? "N/A",
    notesText,
    latestNotes.length
  )

  let summary: string
  try {
    const { text } = await generateText({
      model: getModelInstance(GOOGLE_MODEL.GEMINI_2_5_FLASH),
      prompt
    })
    summary = text
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to generate summary"
    return NextResponse.json<ErrorData>({ message: errorMessage }, { status: 500 })
  }

  await db
    .insert(userSummaries)
    .values({ userId, notesSummary: summary })
    .onConflictDoUpdate({
      target: userSummaries.userId,
      set: { notesSummary: summary, updatedAt: new Date() }
    })

  return NextResponse.json({
    message: existingSummary ? "Summary updated" : "Summary created",
    summary,
    notesCount: latestNotes.length
  })
}
