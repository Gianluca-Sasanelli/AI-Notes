import { InferSelectModel, InferInsertModel } from "drizzle-orm"
import { notes, chats, userSummaries, topics } from "@/db/schema"

export type ErrorData = {
  message: string
  detail?: string
}

export type PaginationOptions = {
  skip?: number
  limit?: number
  includeTotal?: boolean
}

export type PaginatedResponse<T> = {
  data: T[]
  skip: number
  limit: number
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
export type UpdateNoteBody = Partial<Omit<UpdateNoteData, "topicId">> & {
  topic?: { [id: number]: TopicDbData } | { new: TopicDbData } | undefined
}
export type NoteGranularity = "hour" | "day" | "month"
export type TimeNoteSummary = Pick<
  TimeNote,
  "id" | "content" | "startTimestamp" | "endTimestamp" | "updatedAt"
>

export const isTimelessNote = (note: NoteData): note is TimelessNote => {
  return note.startTimestamp === null
}

export const isTimeNote = (note: NoteData): note is TimeNote => {
  return note.startTimestamp !== null
}
export type ChatData = Omit<InferSelectModel<typeof chats>, "userId">
export type ChatHistoryItem = Pick<ChatData, "id" | "title" | "updatedAt">
export type UserSummaryData = InferSelectModel<typeof userSummaries>

export type TopicData = Omit<InferSelectModel<typeof topics>, "userId">
export type TopicDbData = Omit<TopicData, "id" | "createdAt" | "updatedAt">
