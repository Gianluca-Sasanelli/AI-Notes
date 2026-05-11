import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

// Title generation and removePartsFromMessages stay in the Next.js API route.
// This mutation receives already-processed messages and an optional pre-generated title.

export const createChat = mutation({
  args: {
    userId: v.string(),
    clientId: v.string(),
    messages: v.array(v.any()),
    title: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    return ctx.db.insert("chats", {
      userId: args.userId,
      clientId: args.clientId,
      messages: args.messages,
      title: args.title,
      createdAt: now,
      updatedAt: now
    })
  }
})

export const updateChat = mutation({
  args: {
    userId: v.string(),
    clientId: v.string(),
    messages: v.array(v.any())
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db
      .query("chats")
      .withIndex("by_client_id", (q) => q.eq("clientId", args.clientId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .unique()
    if (!chat) throw new Error("Chat not found")
    await ctx.db.patch(chat._id, { messages: args.messages, updatedAt: Date.now() })
  }
})

export const getChat = query({
  args: {
    userId: v.string(),
    clientId: v.string()
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db
      .query("chats")
      .withIndex("by_client_id", (q) => q.eq("clientId", args.clientId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .unique()
    return chat ?? null
  }
})

export const getChats = query({
  args: {
    userId: v.string(),
    skip: v.optional(v.number()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10
    const skip = args.skip ?? 0

    const allChats = await ctx.db
      .query("chats")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect()

    allChats.sort((a, b) => b.updatedAt - a.updatedAt)

    const page = allChats.slice(skip, skip + limit + 1)
    const hasNext = page.length > limit
    const data = (hasNext ? page.slice(0, limit) : page).map((c) => ({
      id: c.clientId,
      title: c.title,
      updatedAt: c.updatedAt
    }))

    return { data, hasNext }
  }
})

export const updateChatTitle = mutation({
  args: {
    userId: v.string(),
    clientId: v.string(),
    title: v.string()
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db
      .query("chats")
      .withIndex("by_client_id", (q) => q.eq("clientId", args.clientId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .unique()
    if (!chat) throw new Error("Chat not found")
    await ctx.db.patch(chat._id, { title: args.title, updatedAt: Date.now() })
  }
})

export const deleteChat = mutation({
  args: {
    userId: v.string(),
    clientId: v.string()
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db
      .query("chats")
      .withIndex("by_client_id", (q) => q.eq("clientId", args.clientId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .unique()
    if (!chat) throw new Error("Chat not found")
    await ctx.db.delete(chat._id)
  }
})
