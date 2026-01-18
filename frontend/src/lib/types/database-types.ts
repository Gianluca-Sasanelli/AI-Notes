import { InferSelectModel, InferInsertModel } from "drizzle-orm"
import { notes, chats, userSummaries, topics } from "@/db/schema"

export type PaginatedResponse<T> = {
  data: T[]
  hasNext: boolean
  total?: number
}
type BaseNoteData = Omit<InferSelectModel<typeof notes>, "userId">

export type DbTimeNote = BaseNoteData & {
  startTimestamp: Date
  granularity: "hour" | "day" | "month"
}
export type TimeNote = DbTimeNote & {
  topic: {
    id: number
    name: string
    color: string
  } | null
}
export type TimelessNote = BaseNoteData & {
  startTimestamp: null
  granularity: null
  topicId: null
}

export type NoteData = TimeNote | TimelessNote
export type NewNoteData = Omit<InferInsertModel<typeof notes>, "userId">
export type UpdateNoteData = Partial<Omit<BaseNoteData, "id">> & {
  content?: Exclude<BaseNoteData["content"], "">
}

export type NoteGranularity = "hour" | "day" | "month"
export type TimeNoteSummary = Pick<
  TimeNote,
  "id" | "content" | "startTimestamp" | "endTimestamp" | "updatedAt"
>

export type ChatData = Omit<InferSelectModel<typeof chats>, "userId">
export type ChatHistoryItem = Pick<ChatData, "id" | "title" | "updatedAt">
export type UserSummaryData = InferSelectModel<typeof userSummaries>

export type TopicData = Omit<InferSelectModel<typeof topics>, "userId">
export type TopicDbData = Omit<TopicData, "id" | "createdAt" | "updatedAt">
