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

export type NoteData = Omit<InferSelectModel<typeof notes>, "userId">
export type NewNoteData = Omit<InferInsertModel<typeof notes>, "userId">
export type UpdateNoteData = Partial<Omit<NoteData, "id">> & {
  content?: Exclude<NoteData["content"], "">
}

export type ChatData = Omit<InferSelectModel<typeof chats>, "userId">
export type ChatHistoryItem = Pick<ChatData, "id" | "title" | "updatedAt">
