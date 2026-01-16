import { db } from "@/index"
import { userSummaries } from "@/db/schema"
import { eq } from "drizzle-orm"
import { logger, withTiming } from "@/lib/logger"

export const getUserSummary = async (userId: string) => {
  logger.debug("db", "Fetching user summary", { userId })
  return withTiming("db", "getUserSummary", async () => {
    const [summary] = await db.select().from(userSummaries).where(eq(userSummaries.userId, userId))
    return summary ?? null
  })
}

export const upsertUserSummary = async (userId: string, notesSummary: string) => {
  logger.debug("db", "Upserting user summary", { userId })
  return withTiming("db", "upsertUserSummary", async () => {
    await db
      .insert(userSummaries)
      .values({ userId, notesSummary })
      .onConflictDoUpdate({
        target: userSummaries.userId,
        set: { notesSummary, updatedAt: new Date() }
      })
  })
}
