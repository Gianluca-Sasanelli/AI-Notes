"use client"

import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function ChatErrorPage({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset?: () => void
}) {
  const isNotFound = error.message === "CHAT_NOT_FOUND"
  const handleNavigate = () => {
    reset?.()
    window.location.href = "/chat"
  }

  return (
    <div className="flex h-[100dvh] flex-col items-center justify-center gap-6 bg-background px-4">
      <div className="bg-destructive/10 flex size-16 items-center justify-center rounded-full">
        <AlertCircle className="size-8 text-destructive" />
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">
          {isNotFound ? "Chat Not Found" : "Something went wrong"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {isNotFound
            ? "This chat may have been deleted or never existed."
            : "We couldn't load this chat. Please try again."}
        </p>
      </div>
      <Button onClick={handleNavigate}>Start a New Chat</Button>
    </div>
  )
}
