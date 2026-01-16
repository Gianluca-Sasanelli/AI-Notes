import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { generateText } from "ai"
import { GOOGLE_MODEL, getModelInstance } from "@/lib/agents/models"
import { buildUserNotesSummaryPrompt } from "@/lib/agents/system-prompts/prompts"
import { ErrorData } from "@/lib/types/database-types"
import { getUserSummary, upsertUserSummary, getNotesAfterDate, getLatestNotes } from "@/db"

export async function POST() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json<ErrorData>({ message: "Unauthorized" }, { status: 401 })
  }

  const existingSummary = await getUserSummary(userId)

  const latestNotes = existingSummary
    ? await getNotesAfterDate(userId, existingSummary.updatedAt, 50)
    : await getLatestNotes(userId, 50)

  if (!existingSummary && latestNotes.length < 5) {
    return NextResponse.json<ErrorData>(
      { message: "There are only " + latestNotes.length + " notes. At least 5 are required." },
      { status: 400 }
    )
  } else if (existingSummary && latestNotes.length === 0) {
    return NextResponse.json<ErrorData>(
      { message: "No new notes since last summary" },
      { status: 400 }
    )
  }

  const notesText = latestNotes
    .map(
      (n, i) =>
        `Note ${i + 1} (${n.startTimestamp.toISOString()} - ${n.endTimestamp?.toISOString?.() || "N/A"}):\n${n.content}`
    )
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

  await upsertUserSummary(userId, summary)

  return NextResponse.json({
    message: existingSummary ? "Summary updated" : "Summary created",
    summary,
    notesCount: latestNotes.length
  })
}
