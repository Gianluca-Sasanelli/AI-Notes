"use client"

import { Button } from "@/components/ui/schadcn/button"
import { AlertCircle } from "lucide-react"
import { T, useGT } from "gt-react"

export default function ChatErrorPage({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset?: () => void
}) {
  const isNotFound = error.message === "CHAT_NOT_FOUND"
  const gt = useGT()
  const handleNavigate = () => {
    reset?.()
    window.location.href = "/chat"
  }

  return (
    <div className="flex h-[100svh] flex-col items-center justify-center gap-6 bg-background px-4">
      <div className="bg-destructive/10 flex size-16 items-center justify-center rounded-full">
        <AlertCircle className="size-8 text-destructive" />
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">
          {isNotFound ? <T>Chat Not Found</T> : <T>Something went wrong</T>}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {isNotFound ? (
            <T>This chat may have been deleted or never existed.</T>
          ) : (
            <T>We couldn&apos;t load this chat. Please try again.</T>
          )}
        </p>
      </div>
      <Button onClick={handleNavigate}>{gt("Start a New Chat")}</Button>
    </div>
  )
}
