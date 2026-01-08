import type { InferUITools } from "ai"
import { tool } from "ai"
import { getTimeNotes, getNoteFiles } from "@/db/db-functions"
import { getFileContent } from "@/lib/storage"
import { z } from "zod"
import { extractText } from "unpdf"

export const NotesTools = (userId: string) => {
  return {
    listNotes: tool({
      description:
        "List all the timed notes in the database. They will be ordered by start timestamp.",
      inputSchema: z.object({
        skip: z.number().optional().describe("The number of notes to skip."),
        limit: z.number().optional().describe("The number of notes to return.")
      }),
      execute: async (options: { skip?: number; limit?: number }) => {
        return getTimeNotes(userId, options.skip, options.limit)
      }
    }),
    getNoteFile: tool({
      description:
        "Get the content of a file attached to a note. For PDFs, returns extracted text. For images, returns metadata.",
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
