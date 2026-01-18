import { UserSummaryData } from "@/lib/types/database-types"

export async function getUserSummaryClient(): Promise<UserSummaryData | null> {
  const res = await fetch("/api/user-summary")
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message)
  }
  const data = await res.json()
  return data.summary
}

export async function updateUserSummaryClient(notesSummary: string) {
  const res = await fetch("/api/user-summary", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notesSummary })
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message)
  }
}

export async function regenerateUserSummaryClient() {
  const res = await fetch("/api/cron/user-note-summary", {
    method: "POST"
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message)
  }
  return res.json()
}
