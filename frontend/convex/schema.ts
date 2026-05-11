import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  topics: defineTable({
    userId: v.string(),
    name: v.string(),
    color: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index("by_user", ["userId"])
    .index("by_user_name", ["userId", "name"]),

  notes: defineTable({
    userId: v.string(),
    topicId: v.optional(v.id("topics")),
    startTimestamp: v.optional(v.number()),
    endTimestamp: v.optional(v.number()),
    granularity: v.optional(
      v.union(v.literal("hour"), v.literal("day"), v.literal("month"))
    ),
    content: v.string(),
    files: v.array(
      v.object({
        storageId: v.id("_storage"),
        filename: v.string(),
        contentType: v.optional(v.string())
      })
    ),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index("by_user", ["userId"])
    .index("by_user_start_timestamp", ["userId", "startTimestamp"]),

  chats: defineTable({
    userId: v.string(),
    clientId: v.string(),
    messages: v.array(v.any()),
    title: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index("by_user", ["userId"])
    .index("by_client_id", ["clientId"]),

  userSummaries: defineTable({
    userId: v.string(),
    notesSummary: v.string(),
    createdAt: v.number(),
    updatedAt: v.number()
  }).index("by_user", ["userId"])
})
