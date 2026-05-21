// All IDs are Convex ID strings. All timestamps are Unix ms (number).

export type NoteGranularity = "hour" | "day" | "month"

export type PaginatedResponse<T> = {
  data: T[]
  hasNext: boolean
  total?: number
}

type BaseNoteData = {
  _id: string
  _creationTime: number
  topicId: string | null
  startTimestamp: number | null
  endTimestamp: number | null
  granularity: NoteGranularity | null
  updatedAt: number
  content: string
  files: string[]
}

export type DbTimeNote = BaseNoteData & {
  startTimestamp: number
  granularity: NoteGranularity
}

export type TimeNote = DbTimeNote & {
  topic: { _id: string; name: string; color: string | undefined } | null
}

export type TimelessNote = BaseNoteData & {
  startTimestamp: null
  granularity: null
  topicId: null
}

export type NoteData = TimeNote | TimelessNote

export type UpdateNoteData = Partial<Omit<BaseNoteData, "_id">> & {
  content?: Exclude<BaseNoteData["content"], "">
}

export type TimeNoteSummary = Pick<
  DbTimeNote,
  "_id" | "content" | "startTimestamp" | "endTimestamp" | "updatedAt"
>

export type ChatData = {
  _id: string
  messages: unknown[]
  title: string | undefined
  _creationTime: number
  updatedAt: number
}

export type ChatHistoryItem = Pick<ChatData, "_id" | "title" | "updatedAt">

export type TopicData = {
  _id: string
  name: string
  color: string | undefined
  _creationTime: number
  updatedAt: number
}

export type TopicDbData = Pick<TopicData, "name" | "color">
