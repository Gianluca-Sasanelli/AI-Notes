import { PaginatedResponse } from "../types/database-types"
import { TopicData } from "../types/database-types"

export async function getTopics(skip: number = 0, limit: number = 10) {
  const params = new URLSearchParams()
  params.set("skip", skip.toString())
  params.set("limit", limit.toString())
  const res = await fetch(`/api/topics?${params.toString()}`)
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message)
  }
  return (await res.json()) as PaginatedResponse<TopicData>
}

export async function SearchTopics(query: string) {
  const res = await fetch(`/api/topics/${query}`)
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message)
  }
  return (await res.json()) as PaginatedResponse<TopicData>
}

export async function deleteTopic(topicId: number) {
  const res = await fetch(`/api/topics/${topicId}`, { method: "DELETE" })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message)
  }
}
