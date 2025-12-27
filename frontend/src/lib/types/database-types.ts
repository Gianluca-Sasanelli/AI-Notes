import { InferSelectModel, InferInsertModel } from "drizzle-orm"
import { notes, chats } from "@/db/schema"

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

export type NoteData = InferSelectModel<typeof notes>
export type NewNoteData = InferInsertModel<typeof notes>
export type UpdateNoteData = Partial<Omit<NoteData, "id">> & {
  content?: Exclude<NoteData["content"], "">
}

export type ChatHistoryItem = Pick<InferSelectModel<typeof chats>, "id" | "title" | "updatedAt">
