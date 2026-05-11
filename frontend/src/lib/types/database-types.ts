// All IDs are Convex ID strings. All timestamps are Unix ms (number).

export type NoteGranularity = "hour" | "day" | "month"

export type PaginatedResponse<T> = {
  data: T[]
  hasNext: boolean
  total?: number
}

type BaseNoteData = {
  id: string
  topicId: string | null
  startTimestamp: number | null
  endTimestamp: number | null
  granularity: NoteGranularity | null
  createdAt: number
  updatedAt: number
  content: string
  files: string[]
}

export type DbTimeNote = BaseNoteData & {
  startTimestamp: number
  granularity: NoteGranularity
}

export type TimeNote = DbTimeNote & {
  topic: { id: string; name: string; color: string | undefined } | null
}

export type TimelessNote = BaseNoteData & {
  startTimestamp: null
  granularity: null
  topicId: null
}

export type NoteData = TimeNote | TimelessNote

export type UpdateNoteData = Partial<Omit<BaseNoteData, "id">> & {
  content?: Exclude<BaseNoteData["content"], "">
}

export type TimeNoteSummary = Pick<
  DbTimeNote,
  "id" | "content" | "startTimestamp" | "endTimestamp" | "updatedAt"
>

export type ChatData = {
  id: string
  messages: unknown[]
  title: string | undefined
  createdAt: number
  updatedAt: number
}

export type ChatHistoryItem = Pick<ChatData, "id" | "title" | "updatedAt">

export type UserSummaryData = {
  userId: string
  notesSummary: string
  createdAt: number
  updatedAt: number
}

export type TopicData = {
  id: string
  name: string
  color: string | undefined
  createdAt: number
  updatedAt: number
}

export type TopicDbData = Pick<TopicData, "name" | "color">
