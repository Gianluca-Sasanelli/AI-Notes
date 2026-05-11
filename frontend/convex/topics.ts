import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const createTopic = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    color: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    if (!args.name.trim()) throw new Error("Topic name cannot be empty")

    // Uniqueness enforced here since Convex has no unique constraints
    const existing = await ctx.db
      .query("topics")
      .withIndex("by_user_name", (q) => q.eq("userId", args.userId).eq("name", args.name))
      .unique()
    if (existing) throw new Error(`Topic "${args.name}" already exists`)

    const now = Date.now()
    return ctx.db.insert("topics", {
      userId: args.userId,
      name: args.name,
      color: args.color,
      createdAt: now,
      updatedAt: now
    })
  }
})

export const getTopicById = query({
  args: {
    userId: v.string(),
    id: v.id("topics")
  },
  handler: async (ctx, args) => {
    const topic = await ctx.db.get(args.id)
    if (!topic || topic.userId !== args.userId) return null
    return { name: topic.name }
  }
})

export const getTopics = query({
  args: {
    userId: v.string(),
    skip: v.optional(v.number()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10
    const skip = args.skip ?? 0

    const allTopics = await ctx.db
      .query("topics")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect()

    allTopics.sort((a, b) => b.updatedAt - a.updatedAt)

    const page = allTopics.slice(skip, skip + limit + 1)
    const hasNext = page.length > limit
    const data = hasNext ? page.slice(0, limit) : page

    return { data, hasNext }
  }
})

export const deleteTopic = mutation({
  args: {
    userId: v.string(),
    id: v.id("topics")
  },
  handler: async (ctx, args) => {
    const topic = await ctx.db.get(args.id)
    if (!topic || topic.userId !== args.userId) throw new Error("Topic not found")
    await ctx.db.delete(args.id)
  }
})

export const updateTopic = mutation({
  args: {
    userId: v.string(),
    id: v.id("topics"),
    name: v.string(),
    color: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    if (!args.name.trim()) throw new Error("Topic name cannot be empty")

    const topic = await ctx.db.get(args.id)
    if (!topic || topic.userId !== args.userId) throw new Error("Topic not found")

    if (args.name !== topic.name) {
      const existing = await ctx.db
        .query("topics")
        .withIndex("by_user_name", (q) => q.eq("userId", args.userId).eq("name", args.name))
        .unique()
      if (existing) throw new Error(`Topic "${args.name}" already exists`)
    }

    await ctx.db.patch(args.id, { name: args.name, color: args.color, updatedAt: Date.now() })
  }
})

export const searchTopics = query({
  args: {
    userId: v.string(),
    query: v.string()
  },
  handler: async (ctx, args) => {
    const allTopics = await ctx.db
      .query("topics")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect()

    // In-memory contains match — preserves the SQL LIKE %query% semantics
    const lowerQuery = args.query.toLowerCase()
    const filtered = allTopics
      .filter((t) => t.name.toLowerCase().includes(lowerQuery))
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 11)

    const hasNext = filtered.length > 10
    const data = hasNext ? filtered.slice(0, 10) : filtered

    return { data, hasNext }
  }
})
