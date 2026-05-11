import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const getUserSummary = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const summary = await ctx.db
      .query("userSummaries")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique()
    return summary ?? null
  }
})

export const upsertUserSummary = mutation({
  args: {
    userId: v.string(),
    notesSummary: v.string()
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userSummaries")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique()

    if (existing) {
      await ctx.db.patch(existing._id, {
        notesSummary: args.notesSummary,
        updatedAt: Date.now()
      })
    } else {
      const now = Date.now()
      await ctx.db.insert("userSummaries", {
        userId: args.userId,
        notesSummary: args.notesSummary,
        createdAt: now,
        updatedAt: now
      })
    }
  }
})
