import { getRedis } from "./redis"

export async function acquireResumeLock(chatId: string): Promise<boolean> {
  try {
    const redis = getRedis()
    const lockKey = `resume-lock:${chatId}`
    const acquired = await redis.set(lockKey, "1", { ex: 3, nx: true })
    return acquired !== null
  } catch {
    return true
  }
}
