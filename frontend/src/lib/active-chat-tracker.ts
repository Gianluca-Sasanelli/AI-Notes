import { getRedis, publishMessage } from "./redis"

const SET_KEY_PREFIX = "active-chats:"
const CHANNEL_PREFIX = "active-chats-channel:"
const SET_TTL_SECONDS = 3600

function setKey(userId: string): string {
  return `${SET_KEY_PREFIX}${userId}`
}

export function activeChatsChannel(userId: string): string {
  return `${CHANNEL_PREFIX}${userId}`
}

export async function registerActiveChat(userId: string, chatId: string): Promise<void> {
  try {
    const redis = getRedis()
    const key = setKey(userId)
    await redis.sadd(key, chatId)
    await redis.expire(key, SET_TTL_SECONDS)
    await publishMessage(activeChatsChannel(userId), JSON.stringify({ type: "register", chatId }))
  } catch (error) {
    console.error("[ActiveChat] Failed to register", { userId, chatId, error })
  }
}

export async function deregisterActiveChat(userId: string, chatId: string): Promise<void> {
  try {
    const redis = getRedis()
    await redis.srem(setKey(userId), chatId)
    await publishMessage(activeChatsChannel(userId), JSON.stringify({ type: "deregister", chatId }))
  } catch (error) {
    console.error("[ActiveChat] Failed to deregister", { userId, chatId, error })
  }
}

export async function getActiveChats(userId: string): Promise<string[]> {
  try {
    const redis = getRedis()
    return (await redis.smembers(setKey(userId))) ?? []
  } catch (error) {
    console.error("[ActiveChat] Failed to fetch", { userId, error })
    return []
  }
}
