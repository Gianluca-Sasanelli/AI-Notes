"use client"

import { useRef, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Upload, X, FileIcon, Loader2, Download, Pencil, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getNoteFilesClient, deleteFileClient, getFileUrlClient } from "@/lib/api"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const MAX_FILE_SIZE_MB = 10
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024

export type PendingFile = {
  file: File
  filename: string
}

type FileUploadProps = {
  noteId?: number
  pendingFiles: PendingFile[]
  onFilesChange: (files: PendingFile[]) => void
  compact?: boolean
}

export function FileUpload(props: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingName, setEditingName] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()
  const { compact = false } = props

  const hasNoteId = props.noteId !== undefined

  const { data, isLoading } = useQuery({
    queryKey: ["note-files", props.noteId],
    queryFn: () => getNoteFilesClient(props.noteId!),
    enabled: hasNoteId
  })

  const deleteMutation = useMutation({
    mutationFn: (filename: string) => {
      if (!hasNoteId) return Promise.reject()
      return deleteFileClient(props.noteId!, filename)
    },
    onSuccess: () => {
      toast.success("File deleted")
      queryClient.invalidateQueries({ queryKey: ["note-files", props.noteId] })
      queryClient.invalidateQueries({ queryKey: ["notes"] })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Delete failed")
    }
  })

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return
    const files = Array.from(fileList)
    const validFiles: File[] = []
    for (const file of files) {
      console.log("File selected:", { name: file.name, size: file.size, type: file.type })
      if (!file.size || file.size === 0) {
        toast.error(`Cannot read file: ${file.name}`)
        continue
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} exceeds ${MAX_FILE_SIZE_MB}MB limit`)
        continue
      }
      validFiles.push(file)
    }
    if (validFiles.length > 0) {
      props.onFilesChange([
        ...props.pendingFiles,
        ...validFiles.map((file) => ({ file, filename: file.name }))
      ])
    }
  }

  const handleRemove = (index: number) => {
    props.onFilesChange(props.pendingFiles.filter((_, i) => i !== index))
  }

  const startEditing = (index: number) => {
    const current = props.pendingFiles[index].filename
    const ext = current.split(".").pop() || ""
    const nameWithoutExt = current.slice(0, current.length - ext.length - 1)
    setEditingIndex(index)
    setEditingName(nameWithoutExt)
  }

  const saveEditing = () => {
    if (editingIndex === null) return
    const original = props.pendingFiles[editingIndex].filename
    const ext = original.split(".").pop() || ""
    const newFilename = editingName.trim() ? `${editingName.trim()}.${ext}` : original
    const updated = props.pendingFiles.map((pf, i) =>
      i === editingIndex ? { ...pf, filename: newFilename } : pf
    )
    props.onFilesChange(updated)
    setEditingIndex(null)
    setEditingName("")
  }

  const handleDelete = (filename: string) => {
    if (hasNoteId) {
      deleteMutation.mutate(filename)
    }
  }

  const handleDownload = async (filename: string) => {
    if (!hasNoteId) return
    try {
      const { url } = await getFileUrlClient(props.noteId!, filename)
      window.open(url, "_blank")
    } catch {
      toast.error("Failed to get file")
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const existingFiles = data?.files ?? []

  return (
    <div className={cn("w-full", compact ? "" : "space-y-3")}>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {compact ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          className="gap-2 text-muted-foreground hover:text-foreground w-full justify-center"
        >
          <Upload className="h-4 w-4" />
          Add File
        </Button>
      ) : (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          )}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">Drop files here or click to upload</p>
        </div>
      )}

      {hasNoteId && isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : null}

      {existingFiles.length > 0 && (
        <ul className={cn("space-y-2 w-full", compact && "mt-3")}>
          {existingFiles.map((filename) => (
            <li
              key={filename}
              className="flex items-center justify-between gap-2 rounded-md border p-2 w-full"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-xs sm:text-sm truncate max-w-[10rem] sm:max-w-none">
                  {filename}
                </span>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon-sm" onClick={() => handleDownload(filename)}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleDelete(filename)}
                  disabled={deleteMutation.isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {props.pendingFiles.length > 0 && (
        <ul className={cn("space-y-2 w-full", compact && existingFiles.length === 0 && "mt-3")}>
          {props.pendingFiles.map((pf, index) => (
            <li
              key={`${pf.filename}-${index}`}
              className="flex items-center justify-between gap-2 rounded-md border p-2 w-full"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                {editingIndex === index ? (
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveEditing()}
                    className="h-6 text-xs sm:text-sm"
                    autoFocus
                  />
                ) : (
                  <span className="text-xs sm:text-sm truncate max-w-[10rem] sm:max-w-none">
                    {pf.filename}
                  </span>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                {editingIndex === index ? (
                  <Button variant="ghost" size="icon-sm" onClick={saveEditing}>
                    <Check className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button variant="ghost" size="icon-sm" onClick={() => startEditing(index)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon-sm" onClick={() => handleRemove(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
