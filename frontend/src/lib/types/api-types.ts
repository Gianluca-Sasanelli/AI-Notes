import { NoteMetadata } from "@/db/schema"
import { NoteData, TimeNote, TopicDbData, DbTimeNote } from "@/lib/types/database-types"

export type TimeNoteBody = Omit<DbTimeNote, "topicId"> & {
  timeless: false
}

export type TimelessNoteBody = DbTimeNote & {
  timeless: true
  content: string
  metadata: NoteMetadata
}
export type TopicBody =
  | { [id: number]: TopicDbData & { modified: boolean } }
  | { new: TopicDbData }
  | undefined
export type UpdateNoteBody = Partial<TimeNoteBody> & {
  topic?: TopicBody
}
export type CreateNoteBody = Omit<
  TimeNoteBody | TimelessNoteBody,
  "createdAt" | "updatedAt" | "files" | "id"
> & {
  topic?: TopicBody
}
export const isTimeNote = (note: NoteData): note is TimeNote => {
  return note.startTimestamp !== null
}

export type ErrorData = {
  message: string
  detail?: string
}

export type PaginationOptions = {
  skip?: number
  limit?: number
  includeTotal?: boolean
}
