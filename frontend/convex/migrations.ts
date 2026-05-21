import { mutation } from "./_generated/server"

export const removeCreatedAt = mutation({
  args: {},
  handler: async (ctx) => {
    const tables = ["notes", "topics", "chats"] as const
    const result: Record<string, { total: number; patched: number }> = {}

    for (const table of tables) {
      const docs = await ctx.db.query(table).collect()
      let patched = 0
      for (const doc of docs) {
        if ("createdAt" in (doc as Record<string, unknown>)) {
          await ctx.db.patch(doc._id, { createdAt: undefined } as never)
          patched++
        }
      }
      result[table] = { total: docs.length, patched }
    }

    return result
  }
})
