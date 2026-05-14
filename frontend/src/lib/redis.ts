import { Redis } from "@upstash/redis"
import IORedis from "ioredis"
import { createResumableStreamContext } from "resumable-stream/ioredis"

const url = process.env.UPSTASH_REDIS_REST_URL
const token = process.env.UPSTASH_REDIS_REST_TOKEN

if (!url || !token) {
  throw new Error("Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN environment variable")
}

console.log("[Redis] Initializing Upstash HTTP client")
const redis = new Redis({ url, token })

const hostname = url.replace("https://", "")
const redisUrl = `rediss://default:${token}@${hostname}:6379`

export function getRedis(): Redis {
  return redis
}

let resumableStreamContext: ReturnType<typeof createResumableStreamContext> | null = null
let pubsubPublisher: IORedis | null = null
let pubsubSubscriber: IORedis | null = null
const channelHandlers = new Map<string, Set<(message: string) => void>>()

function ensurePubSub() {
  if (!pubsubPublisher) {
    console.log("[Redis PubSub] Creating publisher connection")
    pubsubPublisher = new IORedis(redisUrl, { maxRetriesPerRequest: 3 })
    pubsubPublisher.on("error", (err) => {
      console.error("[Redis PubSub] Publisher error:", err.message)
    })
    pubsubPublisher.on("ready", () => {
      console.log("[Redis PubSub] Publisher connected")
    })
  }
  if (!pubsubSubscriber) {
    console.log("[Redis PubSub] Creating subscriber connection")
    pubsubSubscriber = new IORedis(redisUrl, { maxRetriesPerRequest: 3 })
    pubsubSubscriber.on("error", (err) => {
      console.error("[Redis PubSub] Subscriber error:", err.message)
    })
    pubsubSubscriber.on("ready", () => {
      console.log("[Redis PubSub] Subscriber connected")
    })
    pubsubSubscriber.on("message", (channel: string, message: string) => {
      console.log(`[Redis PubSub] Received message on ${channel}`)
      const handlers = channelHandlers.get(channel)
      if (!handlers) return
      for (const handler of handlers) {
        handler(message)
      }
    })
  }
}

export function addChannelListener(
  channel: string,
  handler: (message: string) => void
): () => void {
  ensurePubSub()

  let handlers = channelHandlers.get(channel)
  if (!handlers) {
    handlers = new Set()
    channelHandlers.set(channel, handlers)
    console.log(`[Redis PubSub] Subscribing to ${channel}`)
    pubsubSubscriber!.subscribe(channel).catch((err) => {
      console.error(`[Redis PubSub] Failed to subscribe to ${channel}:`, err.message)
    })
  }
  handlers.add(handler)

  return () => {
    const current = channelHandlers.get(channel)
    if (!current) return
    current.delete(handler)
    if (current.size === 0) {
      channelHandlers.delete(channel)
      console.log(`[Redis PubSub] Unsubscribing from ${channel}`)
      pubsubSubscriber?.unsubscribe(channel).catch(() => {})
    }
  }
}

export async function publishMessage(channel: string, message: string): Promise<void> {
  ensurePubSub()
  console.log(`[Redis PubSub] Publishing to ${channel}`)
  await pubsubPublisher!.publish(channel, message)
}

export function getResumableStreamContext() {
  if (!resumableStreamContext) {
    console.log("[Redis] Creating resumable stream context (2 new TCP connections)")
    const publisher = new IORedis(redisUrl, { maxRetriesPerRequest: 3 })
    const subscriber = new IORedis(redisUrl, { maxRetriesPerRequest: 3 })

    publisher.on("error", (err) => {
      console.error("[Redis Resumable] Publisher error:", err.message)
    })
    publisher.on("ready", () => {
      console.log("[Redis Resumable] Publisher connected")
    })
    subscriber.on("error", (err) => {
      console.error("[Redis Resumable] Subscriber error:", err.message)
    })
    subscriber.on("ready", () => {
      console.log("[Redis Resumable] Subscriber connected")
    })

    resumableStreamContext = createResumableStreamContext({
      waitUntil: null,
      publisher,
      subscriber
    })
  }
  return resumableStreamContext
}
