import type { InferUITools } from "ai"
import { tool } from "ai"
import { z } from "zod"
import { extractText } from "unpdf"
import { logger } from "@/lib/logger"
import { convex } from "@/lib/convex-server"
import { api } from "@convex/_generated/api"
import { Id } from "@convex/_generated/dataModel"
import { getFileContent } from "@/lib/storage"

const MAX_RANGE_MS = 31 * 24 * 60 * 60 * 1000

export const NotesTools = (userId: string) => {
  return {
    listNotes: tool({
      description:
        "List all the timed notes in the database. They will be ordered by start timestamp. Returns [{ id, content, startTimestamp, endTimestamp, granularity, files }]",
      inputSchema: z.object({
        skip: z.number().optional().describe("The number of notes to skip."),
        limit: z.number().optional().describe("The number of notes to return.")
      }),
      execute: async (options: { skip?: number; limit?: number }) => {
        const { data } = await convex.query(api.notes.getTimeNotes, {
          userId,
          skip: options.skip,
          limit: options.limit
        })
        return data.map((n) => ({ ...n, files: n.files.map((f) => f.filename) }))
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
        return convex.query(api.notes.getTimeNotesByDateRange, {
          userId,
          from: fromDate.getTime(),
          to: toDate.getTime()
        })
      }
    }),
    listTopics: tool({
      description:
        "List all topics the user has created. Returns [{ id, name, color }]. Use this to discover available topics before fetching notes by topic.",
      inputSchema: z.object({}),
      execute: async () => {
        const { data } = await convex.query(api.topics.getTopics, {
          userId,
          limit: 50
        })
        return data.map((t) => ({ id: t._id, name: t.name, color: t.color }))
      }
    }),
    getNotesByTopic: tool({
      description:
        "Get all notes belonging to a specific topic. Returns [{ id, content, startTimestamp, endTimestamp }]. Use listTopics first to get valid topic IDs.",
      inputSchema: z.object({
        topicId: z.string().describe("The topic ID to fetch notes for.")
      }),
      execute: async ({ topicId }: { topicId: string }) => {
        const notes = await convex.query(api.notes.getNotesByTopicId, {
          userId,
          topicId: topicId as Id<"topics">
        })
        return notes.map((n) => ({
          id: n._id,
          content: n.content,
          startTimestamp: n.startTimestamp,
          endTimestamp: n.endTimestamp
        }))
      }
    }),
    getNoteFile: tool({
      description:
        "Get the content of a file attached to a note. For PDFs returns { type, filename, text, pages }. For images returns { type, filename, size }. Otherwise { type: 'unknown', filename, size } or { error }.",
      inputSchema: z.object({
        noteId: z.string().describe("The ID of the note containing the file."),
        filename: z.string().describe("The filename to retrieve.")
      }),
      execute: async ({ noteId, filename }: { noteId: string; filename: string }) => {
        const files = await convex.query(api.notes.getNoteFiles, {
          userId,
          noteId: noteId as Id<"notes">
        })
        const filenames = files.map((f) => f.filename)
        if (!filenames.includes(filename)) {
          logger.error("notes-tools", "File not found in this note", {
            noteId,
            filename,
            files: filenames
          })
          return {
            error:
              "File not found in this note. The available files are: " +
              filenames.join(", ") +
              ". You passed: " +
              filename +
              "."
          }
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
