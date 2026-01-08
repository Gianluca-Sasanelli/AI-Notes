import { FileIcon, Loader2, PaperclipIcon, SendIcon, StopCircle, X } from "lucide-react"
import { useEffect, useRef, useState, type KeyboardEvent as KeyboardEventReact } from "react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { handleGlobalKeyDown } from "@/lib/hooks"
import { ModelSelector } from "./ModelSelector"
import Image from "next/image"
import React from "react"
interface ChatInputProps {
  onSendMessage: (text: string, files?: FileList) => void
  isLoading: boolean
  onStopGeneration?: () => void
}

interface FilePreview {
  file: File
  previewUrl: string
  type: "image" | "pdf"
}

const ChatInput = React.memo(function ChatInput({
  onSendMessage,
  isLoading,
  onStopGeneration
}: ChatInputProps) {
  const [input, setInput] = useState("")
  const taRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [attachedFiles, setAttachedFiles] = useState<FilePreview[]>([])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => handleGlobalKeyDown(e, setInput, taRef)
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [taRef, setInput])

  const handleKeyDown = (e: KeyboardEventReact<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(input)
    }
  }
  useEffect(() => {
    const ta = taRef.current
    if (!ta) return
    ta.style.height = "auto"
    ta.style.height = `${ta.scrollHeight}px`
  }, [input])

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newFiles = Array.from(files).map((file) => ({
      file,
      previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
      type: file.type.startsWith("image/") ? ("image" as const) : ("pdf" as const)
    }))
    setAttachedFiles((prev) => [...prev, ...newFiles])
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items
    if (!items) {
      return
    }

    const files = Array.from(items)
      .filter((item) => item.kind === "file")
      .map((item) => item.getAsFile())
      .filter((file): file is File => file !== null)

    if (files.length > 0) {
      e.preventDefault()
      const newFiles = files.map((file) => ({
        file,
        previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
        type: file.type.startsWith("image/") ? ("image" as const) : ("pdf" as const)
      }))
      setAttachedFiles((prev) => [...prev, ...newFiles])
    }
  }

  const handleSendMessage = (input: string) => {
    let fileListToSend: FileList | undefined = undefined
    if (attachedFiles && attachedFiles.length > 0) {
      const dataTransfer = new DataTransfer()
      attachedFiles.forEach((file) => dataTransfer.items.add(file.file))
      fileListToSend = dataTransfer.files
    }
    onSendMessage(input, fileListToSend)

    setInput("")
    setAttachedFiles([])
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => {
      const newFiles = [...prev]
      if (newFiles[index].type === "image") {
        URL.revokeObjectURL(newFiles[index].previewUrl)
      }
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  return (
    <div className="flex w-full flex-col rounded-xl border-2 pl-1 py-1 lg:py-2 lg:pl-2 shadow-md focus-within:border-primary">
      {attachedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 pr-2">
          {attachedFiles.map((file, index) => (
            <div key={file.file.name} className="relative">
              {file.type === "image" ? (
                <Image
                  src={file.previewUrl}
                  alt="Preview"
                  width={64}
                  height={64}
                  className="size-16 rounded-lg object-cover"
                />
              ) : (
                <div className="flex size-16 items-center justify-center rounded-lg">
                  <FileIcon className="size-8 text-primary" />
                </div>
              )}
              <button
                onClick={() => removeFile(index)}
                className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground hover:bg-warning"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="w-full flex-1 flex-col gap-2">
        <input
          ref={fileInputRef}
          onChange={handleUploadFile}
          type="file"
          accept="image/*,.pdf"
          multiple
          className="hidden"
        />
        <Textarea
          ref={taRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="Ask about your notes, or health issues..."
          className="max-h-[35vh] overflow-y-auto border-none bg-transparent text-base focus:outline-none focus:ring-0"
        />
        <div className="flex max-h-[30%] items-center justify-between pr-2">
          <ModelSelector />
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-full text-muted-foreground hover:text-foreground"
              disabled={isLoading}
              title="Upload file"
              onClick={triggerFileInput}
            >
              <PaperclipIcon className="size-6" />
            </Button>
            {isLoading && onStopGeneration ? (
              <Button
                onClick={onStopGeneration}
                variant="ghost"
                size="icon"
                className="size-full max-w-12"
                title="Stop Generation"
              >
                <StopCircle className="size-6" />
              </Button>
            ) : (
              <Button
                onClick={() => {
                  handleSendMessage(input)
                }}
                disabled={isLoading || !input.trim()}
                variant="ghost"
                size="icon"
                className="hover:bg-primary/10"
                title={isLoading ? "Generating..." : "Send Message"}
              >
                {isLoading ? (
                  <Loader2 className="size-6 animate-spin" />
                ) : (
                  <SendIcon className="size-6" />
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

export default ChatInput
