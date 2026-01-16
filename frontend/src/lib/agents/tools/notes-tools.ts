import type { InferUITools } from "ai"
import { tool } from "ai"
import { getTimeNotes, getNoteFiles, getTimeNotesByDateRange } from "@/db"
import { getFileContent } from "@/lib/storage"
import { z } from "zod"
import { extractText } from "unpdf"

const MAX_RANGE_MS = 31 * 24 * 60 * 60 * 1000

export const NotesTools = (userId: string) => {
  return {
    listNotes: tool({
      description:
        "List all the timed notes in the database. They will be ordered by start timestamp. Returns [{ id, content, startTimestamp, endTimestamp, granularity, metadata, files }]",
      inputSchema: z.object({
        skip: z.number().optional().describe("The number of notes to skip."),
        limit: z.number().optional().describe("The number of notes to return.")
      }),
      execute: async (options: { skip?: number; limit?: number }) => {
        const { data } = await getTimeNotes(userId, options.skip, options.limit)
        return data
      }
    }),
    listNotesByDateRange: tool({
      description:
        "List notes within a date range. Maximum range is 1 month. Use this to find notes in a specific time period. Returns [{ id, content, startTimestamp, endTimestamp, updatedAt }] or { error } if invalid.",
      inputSchema: z.object({
        from: z.string().describe("Start date in ISO format (e.g. 2026-01-01)"),
        to: z.string().describe("End date in ISO format (e.g. 2026-01-31)")
      }),
      execute: async ({ from, to }: { from: string; to: string }) => {
        const fromDate = new Date(from)
        const toDate = new Date(to)
        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
          return { error: "Invalid date format" }
        }
        if (toDate.getTime() - fromDate.getTime() > MAX_RANGE_MS) {
          return { error: "Date range exceeds 1 month maximum" }
        }
        if (fromDate > toDate) {
          return { error: "From date must be before to date" }
        }
        return getTimeNotesByDateRange(userId, fromDate, toDate)
      }
    }),
    getNoteFile: tool({
      description:
        "Get the content of a file attached to a note. For PDFs returns { type, filename, text, pages }. For images returns { type, filename, size }. Otherwise { type: 'unknown', filename, size } or { error }.",
      inputSchema: z.object({
        noteId: z.number().describe("The ID of the note containing the file."),
        filename: z.string().describe("The filename to retrieve.")
      }),
      execute: async ({ noteId, filename }: { noteId: number; filename: string }) => {
        const files = await getNoteFiles(userId, noteId)
        if (!files.includes(filename)) {
          return { error: "File not found in this note" }
        }

        const buffer = await getFileContent(userId, noteId, filename)
        const ext = filename.split(".").pop()?.toLowerCase()

        if (ext === "pdf") {
          const { text, totalPages } = await extractText(new Uint8Array(buffer))
          return { type: "pdf", filename, text, pages: totalPages }
        }

        if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")) {
          return { type: "image", filename, size: buffer.length }
        }

        return { type: "unknown", filename, size: buffer.length }
      }
    })
  }
}

export type NotesToolsType = InferUITools<ReturnType<typeof NotesTools>>
