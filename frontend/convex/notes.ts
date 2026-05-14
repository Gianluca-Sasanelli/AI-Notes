import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

const granularityValidator = v.union(
  v.literal("hour"),
  v.literal("day"),
  v.literal("month")
)

export const createNote = mutation({
  args: {
    userId: v.string(),
    content: v.string(),
    startTimestamp: v.optional(v.number()),
    endTimestamp: v.optional(v.number()),
    granularity: v.optional(granularityValidator),
    topicId: v.optional(v.id("topics"))
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    return ctx.db.insert("notes", {
      userId: args.userId,
      content: args.content,
      startTimestamp: args.startTimestamp,
      endTimestamp: args.endTimestamp,
      granularity: args.granularity,
      topicId: args.topicId,
      files: [],
      createdAt: now,
      updatedAt: now
    })
  }
})

export const getTimeNotes = query({
  args: {
    userId: v.string(),
    skip: v.optional(v.number()),
    limit: v.optional(v.number()),
    includeTotal: v.optional(v.boolean()),
    topicId: v.optional(v.id("topics"))
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10
    const skip = args.skip ?? 0

    let allNotes = await ctx.db
      .query("notes")
      .withIndex("by_user_start_timestamp", (q) => q.eq("userId", args.userId))
      .filter((q) => q.neq(q.field("startTimestamp"), undefined))
      .order("desc")
      .collect()

    if (args.topicId !== undefined) {
      allNotes = allNotes.filter((n) => n.topicId === args.topicId)
    }

    const total = args.includeTotal ? allNotes.length : undefined
    const page = allNotes.slice(skip, skip + limit + 1)
    const hasNext = page.length > limit
    const items = hasNext ? page.slice(0, limit) : page

    // Resolve topic for each note — multiple db.get() calls are batched in Convex
    const data = await Promise.all(
      items.map(async (note) => {
        let topic = null
        if (note.topicId) {
          const t = await ctx.db.get(note.topicId)
          if (t) topic = { _id: t._id, name: t.name, color: t.color }
        }
        return { ...note, topic }
      })
    )

    return { data, hasNext, total }
  }
})

export const getTimelessNotes = query({
  args: {
    userId: v.string(),
    skip: v.optional(v.number()),
    limit: v.optional(v.number()),
    includeTotal: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10
    const skip = args.skip ?? 0

    const allNotes = await ctx.db
      .query("notes")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("startTimestamp"), undefined))
      .collect()

    // Sort by createdAt desc in memory (no index needed for personal-scale data)
    allNotes.sort((a, b) => b.createdAt - a.createdAt)

    const total = args.includeTotal ? allNotes.length : undefined
    const page = allNotes.slice(skip, skip + limit + 1)
    const hasNext = page.length > limit
    const data = hasNext ? page.slice(0, limit) : page

    return { data, hasNext, total }
  }
})

export const getNote = query({
  args: {
    userId: v.string(),
    id: v.id("notes")
  },
  handler: async (ctx, args) => {
    const note = await ctx.db.get(args.id)
    if (!note || note.userId !== args.userId) return null
    return note
  }
})

export const updateNote = mutation({
  args: {
    userId: v.string(),
    id: v.id("notes"),
    content: v.optional(v.string()),
    // null means "clear the field"
    startTimestamp: v.optional(v.union(v.number(), v.null())),
    endTimestamp: v.optional(v.union(v.number(), v.null())),
    granularity: v.optional(v.union(granularityValidator, v.null())),
    topicId: v.optional(v.union(v.id("topics"), v.null())),
    files: v.optional(v.array(v.string()))
  },
  handler: async (ctx, args) => {
    const note = await ctx.db.get(args.id)
    if (!note || note.userId !== args.userId) throw new Error("Note not found")

    const patch: Record<string, unknown> = { updatedAt: Date.now() }
    if (args.content !== undefined) patch.content = args.content
    if (args.files !== undefined) patch.files = args.files
    // null → undefined removes the optional field from the document
    if (args.startTimestamp !== undefined) patch.startTimestamp = args.startTimestamp ?? undefined
    if (args.endTimestamp !== undefined) patch.endTimestamp = args.endTimestamp ?? undefined
    if (args.granularity !== undefined) patch.granularity = args.granularity ?? undefined
    if (args.topicId !== undefined) patch.topicId = args.topicId ?? undefined

    await ctx.db.patch(args.id, patch)
  }
})

export const deleteNote = mutation({
  args: {
    userId: v.string(),
    id: v.id("notes")
  },
  handler: async (ctx, args) => {
    const note = await ctx.db.get(args.id)
    if (!note || note.userId !== args.userId) throw new Error("Note not found")
    for (const f of note.files) {
      await ctx.storage.delete(f.storageId)
    }
    await ctx.db.delete(args.id)
  }
})
export const getLatestNotes = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10
    return ctx.db
      .query("notes")
      .withIndex("by_user_start_timestamp", (q) => q.eq("userId", args.userId))
      .filter((q) => q.neq(q.field("startTimestamp"), undefined))
      .order("desc")
      .take(limit)
  }
})

export const getLatestTimelessNotes = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20
    const notes = await ctx.db
      .query("notes")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("startTimestamp"), undefined))
      .collect()

    notes.sort((a, b) => b.createdAt - a.createdAt)
    return notes.slice(0, limit)
  }
})

export const addFileToNote = mutation({
  args: {
    userId: v.string(),
    noteId: v.id("notes"),
    storageId: v.id("_storage"),
    filename: v.string(),
    contentType: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const note = await ctx.db.get(args.noteId)
    if (!note || note.userId !== args.userId) throw new Error("Note not found")
    await ctx.db.patch(args.noteId, {
      files: [
        ...note.files,
        { storageId: args.storageId, filename: args.filename, contentType: args.contentType }
      ],
      updatedAt: Date.now()
    })
  }
})

export const removeFileFromNote = mutation({
  args: {
    userId: v.string(),
    noteId: v.id("notes"),
    filename: v.string()
  },
  handler: async (ctx, args) => {
    const note = await ctx.db.get(args.noteId)
    if (!note || note.userId !== args.userId) throw new Error("Note not found")
    const target = note.files.find((f) => f.filename === args.filename)
    if (!target) return
    await ctx.storage.delete(target.storageId)
    await ctx.db.patch(args.noteId, {
      files: note.files.filter((f) => f.filename !== args.filename),
      updatedAt: Date.now()
    })
  }
})

export const getNoteFiles = query({
  args: {
    userId: v.string(),
    noteId: v.id("notes")
  },
  handler: async (ctx, args) => {
    const note = await ctx.db.get(args.noteId)
    if (!note || note.userId !== args.userId) return []
    return note.files
  }
})

export const getTimeNotesByDateRange = query({
  args: {
    userId: v.string(),
    from: v.number(),
    to: v.number()
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("notes")
      .withIndex("by_user_start_timestamp", (q) =>
        q.eq("userId", args.userId).gte("startTimestamp", args.from).lte("startTimestamp", args.to)
      )
      .order("desc")
      .collect()
  }
})

export const getNotesByTopicId = query({
  args: {
    userId: v.string(),
    topicId: v.id("topics")
  },
  handler: async (ctx, args) => {
    const notes = await ctx.db
      .query("notes")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("topicId"), args.topicId))
      .collect()

    notes.sort((a, b) => (b.startTimestamp ?? 0) - (a.startTimestamp ?? 0))
    return notes
  }
})

export const countNotesByTopicId = query({
  args: {
    userId: v.string(),
    topicId: v.id("topics")
  },
  handler: async (ctx, args) => {
    const notes = await ctx.db
      .query("notes")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("topicId"), args.topicId))
      .collect()
    return notes.length
  }
})
