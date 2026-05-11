import { mutation, query, action } from "./_generated/server"
import { v } from "convex/values"
import { api } from "./_generated/api"
import { Id } from "./_generated/dataModel"

export const generateUploadUrl = mutation({
  args: {
    userId: v.string(),
    noteId: v.id("notes")
  },
  handler: async (ctx, args) => {
    const note = await ctx.db.get(args.noteId)
    if (!note || note.userId !== args.userId) throw new Error("Note not found")
    return await ctx.storage.generateUploadUrl()
  }
})

export const getFileUrl = query({
  args: {
    userId: v.string(),
    noteId: v.id("notes"),
    filename: v.string()
  },
  handler: async (ctx, args) => {
    const note = await ctx.db.get(args.noteId)
    if (!note || note.userId !== args.userId) return null
    const target = note.files.find((f) => f.filename === args.filename)
    if (!target) return null
    return await ctx.storage.getUrl(target.storageId)
  }
})

export const getFileContent = action({
  args: {
    userId: v.string(),
    noteId: v.id("notes"),
    filename: v.string()
  },
  handler: async (ctx, args): Promise<{ bytes: ArrayBuffer; contentType: string | null } | null> => {
    const files = await ctx.runQuery(api.notes.getNoteFiles, {
      userId: args.userId,
      noteId: args.noteId
    })
    const target = files.find((f: { filename: string }) => f.filename === args.filename) as
      | { storageId: Id<"_storage">; filename: string; contentType?: string }
      | undefined
    if (!target) return null
    const blob = await ctx.storage.get(target.storageId)
    if (!blob) return null
    const bytes = await blob.arrayBuffer()
    return { bytes, contentType: target.contentType ?? null }
  }
})
