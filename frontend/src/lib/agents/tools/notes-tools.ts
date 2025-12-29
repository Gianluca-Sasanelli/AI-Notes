import type { InferUITools } from "ai"
import { tool } from "ai"
import { getNotes } from "@/db/db-functions"
import { z } from "zod"

export const NotesTools = (userId: string) => {
  return {
    listNotes: tool({
      description: "List all the notes in the database. They will be order by start timestamp.",
      inputSchema: z.object({
        skip: z.number().optional().describe("The number of notes to skip."),
        limit: z.number().optional().describe("The number of notes to return.")
      }),
      execute: async (options: { skip?: number; limit?: number }) => {
        return getNotes(userId, options.skip, options.limit)
      }
    })
  }
}

export type NotesToolsType = InferUITools<ReturnType<typeof NotesTools>>
