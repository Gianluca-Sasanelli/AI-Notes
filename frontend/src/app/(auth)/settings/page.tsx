"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2, Sun, Moon, Monitor, RefreshCw } from "lucide-react"
import {
  getUserSummaryClient,
  updateUserSummaryClient,
  regenerateUserSummaryClient
} from "@/lib/api"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const queryClient = useQueryClient()
  const [editedSummary, setEditedSummary] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    queueMicrotask(() => setMounted(true))
  }, [])

  const { data: summary, isLoading } = useQuery({
    queryKey: ["userSummary"],
    queryFn: getUserSummaryClient
  })

  const { mutate: updateSummary, isPending: isSaving } = useMutation({
    mutationFn: updateUserSummaryClient,
    onSuccess: () => {
      toast.success("Summary saved")
      queryClient.invalidateQueries({ queryKey: ["userSummary"] })
      setEditedSummary(null)
    },
    onError: () => {
      toast.error("Failed to save summary")
    }
  })

  const { mutate: regenerateSummary, isPending: isRegenerating } = useMutation({
    mutationFn: regenerateUserSummaryClient,
    onSuccess: () => {
      toast.success("Summary regenerated from your notes")
      queryClient.invalidateQueries({ queryKey: ["userSummary"] })
      setEditedSummary(null)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to regenerate summary")
    }
  })

  const currentValue = editedSummary ?? summary?.notesSummary ?? ""
  const hasChanges = editedSummary !== null && editedSummary !== (summary?.notesSummary ?? "")

  const handleSave = () => {
    if (editedSummary !== null && editedSummary.trim() !== "") {
      updateSummary(editedSummary)
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto py-10 px-4 min-dvh-screen overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your preferences</p>
      </div>

      <div className="space-y-6">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-2">Theme</h2>
          <p className="text-sm text-muted-foreground mb-4">Choose your preferred color scheme.</p>
          <div className="flex gap-2">
            <Button
              variant={mounted && theme === "light" ? "default" : "outline"}
              onClick={() => setTheme("light")}
              className="flex-1"
            >
              <Sun className="size-4 mr-2" />
              Light
            </Button>
            <Button
              variant={mounted && theme === "dark" ? "default" : "outline"}
              onClick={() => setTheme("dark")}
              className="flex-1"
            >
              <Moon className="size-4 mr-2" />
              Dark
            </Button>
            <Button
              variant={mounted && theme === "system" ? "default" : "outline"}
              onClick={() => setTheme("system")}
              className="flex-1"
            >
              <Monitor className="size-4 mr-2" />
              System
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-2">AI Summary</h2>
          <p className="text-sm text-muted-foreground mb-4">
            This summary is used as context when you chat with the AI assistant. It&apos;s
            automatically generated from your notes but you can edit it.
          </p>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <Textarea
                value={currentValue}
                onChange={(e) => setEditedSummary(e.target.value)}
                placeholder="No summary yet. Add at least 5 notes to generate one automatically."
                className="min-h-[200px] resize-y bg-secondary focus:border-primary focus:outline-none"
              />
              {summary && (
                <p className="text-xs text-muted-foreground mt-2">
                  Last updated: {new Date(summary.updatedAt).toLocaleString()}
                </p>
              )}
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => regenerateSummary()}
                  disabled={isRegenerating || isSaving}
                >
                  {isRegenerating ? (
                    <Loader2 className="size-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="size-4 mr-2" />
                  )}
                  Regenerate from Notes
                </Button>
                <Button onClick={handleSave} disabled={!hasChanges || isSaving || isRegenerating}>
                  {isSaving && <Loader2 className="size-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
