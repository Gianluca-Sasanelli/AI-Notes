import { convex } from "@/lib/convex-server"
import { api } from "@convex/_generated/api"
import { Id } from "@convex/_generated/dataModel"

export const sanitizeFilename = (filename: string): string => {
  const ext = filename.split(".").pop() || ""
  const name = filename.slice(0, filename.length - ext.length - 1)
  const sanitized = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
  return sanitized ? `${sanitized}.${ext}` : `file_${Date.now()}.${ext}`
}

export const uploadFile = async (
  userId: string,
  noteId: string,
  filename: string,
  file: Buffer,
  contentType: string
) => {
  const uploadUrl = await convex.mutation(api.files.generateUploadUrl, {
    userId,
    noteId: noteId as Id<"notes">
  })
  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": contentType },
    body: new Uint8Array(file)
  })
  if (!res.ok) throw new Error(`Upload failed: ${res.status} ${await res.text()}`)
  const { storageId } = (await res.json()) as { storageId: Id<"_storage"> }
  await convex.mutation(api.notes.addFileToNote, {
    userId,
    noteId: noteId as Id<"notes">,
    storageId,
    filename,
    contentType
  })
  return filename
}

export const deleteFile = async (userId: string, noteId: string, filename: string) => {
  await convex.mutation(api.notes.removeFileFromNote, {
    userId,
    noteId: noteId as Id<"notes">,
    filename
  })
}

export const getFileUrl = async (userId: string, noteId: string, filename: string) => {
  const url = await convex.query(api.files.getFileUrl, {
    userId,
    noteId: noteId as Id<"notes">,
    filename
  })
  if (!url) throw new Error("File not found")
  return url
}

export const getFileContent = async (userId: string, noteId: string, filename: string) => {
  const result = await convex.action(api.files.getFileContent, {
    userId,
    noteId: noteId as Id<"notes">,
    filename
  })
  if (!result) throw new Error("File not found")
  return Buffer.from(result.bytes)
}
