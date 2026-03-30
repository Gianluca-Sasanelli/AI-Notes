import { createResumableStreamContext } from "resumable-stream/ioredis"
import { after } from "next/server"
import { createRedisClient } from "./redis"

// Singleton instances to reuse across requests
let publisher: ReturnType<typeof createRedisClient> | undefined
let subscriber: ReturnType<typeof createRedisClient> | undefined

function getPublisher() {
  if (!publisher) {
    publisher = createRedisClient()
  }
  return publisher
}

function getSubscriber() {
  if (!subscriber) {
    subscriber = createRedisClient()
  }
  return subscriber
}

export function getStreamContext() {
  return createResumableStreamContext({
    waitUntil: after,
    publisher: getPublisher(),
    subscriber: getSubscriber()
  })
}
