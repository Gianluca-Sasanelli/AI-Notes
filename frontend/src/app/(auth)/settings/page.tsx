"use client"

import { useState, useEffect, useRef } from "react"
import { useTheme } from "next-themes"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
  Loader2,
  Sun,
  Moon,
  Monitor,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
  X,
  Tag
} from "lucide-react"
import {
  getUserSummaryClient,
  updateUserSummaryClient,
  regenerateUserSummaryClient,
  getNotesClient,
  createTimelessNoteClient,
  updateNoteClient,
  deleteNoteClient
} from "@/lib/api"
import { useIsMobile } from "@/lib/hooks"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"
import type { TimelessNote } from "@/lib/types/database-types"
import { useQuickTagsStore } from "@/lib/stores/metadata-store"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const queryClient = useQueryClient()
  const isMobile = useIsMobile()
  const [editedSummary, setEditedSummary] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  const [newNoteContent, setNewNoteContent] = useState("")
  const [editingNote, setEditingNote] = useState<TimelessNote | null>(null)
  const [editingContent, setEditingContent] = useState("")
  const [deletingNoteId, setDeletingNoteId] = useState<number | null>(null)

  const { tags, addTag, removeTag, updateTag, resetToDefaults } = useQuickTagsStore()
  const [newTag, setNewTag] = useState("")
  const [editingTagNewName, setEditingTagNewName] = useState<string | null>(null)
  const editingTagOldName = useRef<string | null>(null)

  useEffect(() => {
    queueMicrotask(() => setMounted(true))
  }, [])

  const { data: summary, isLoading } = useQuery({
    queryKey: ["userSummary"],
    queryFn: getUserSummaryClient
  })

  const { data: contextNotes, isLoading: notesLoading } = useQuery({
    queryKey: ["timelessNotes"],
    queryFn: () => getNotesClient({ skip: 0, limit: 100, timeless: true })
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

  const createNoteMutation = useMutation({
    mutationFn: () => createTimelessNoteClient(newNoteContent.trim(), {}),
    onSuccess: () => {
      toast.success("Note added")
      setNewNoteContent("")
      queryClient.invalidateQueries({ queryKey: ["timelessNotes"] })
    },
    onError: () => {
      toast.error("Failed to add note")
    }
  })

  const updateNoteMutation = useMutation({
    mutationFn: () => {
      if (!editingNote) return Promise.reject()
      return updateNoteClient(editingNote.id, {
        content: editingContent.trim(),
        metadata: editingNote.metadata
      })
    },
    onSuccess: () => {
      toast.success("Note updated")
      setEditingNote(null)
      queryClient.invalidateQueries({ queryKey: ["timelessNotes"] })
    },
    onError: () => {
      toast.error("Failed to update note")
    }
  })

  const deleteNoteMutation = useMutation({
    mutationFn: () => {
      if (!deletingNoteId) return Promise.reject()
      return deleteNoteClient(deletingNoteId)
    },
    onSuccess: () => {
      toast.success("Note deleted")
      setDeletingNoteId(null)
      queryClient.invalidateQueries({ queryKey: ["timelessNotes"] })
    },
    onError: () => {
      toast.error("Failed to delete note")
    }
  })

  const currentValue = editedSummary ?? summary?.notesSummary ?? ""
  const hasChanges = editedSummary !== null && editedSummary !== (summary?.notesSummary ?? "")

  const handleSave = () => {
    if (editedSummary !== null && editedSummary.trim() !== "") {
      updateSummary(editedSummary)
    }
  }

  const handleEditOpen = (note: TimelessNote) => {
    setEditingContent(note.content)
    setEditingNote(note)
  }

  const handleAddTag = () => {
    if (!newTag.trim()) return
    addTag(newTag.trim().toLowerCase())
    setNewTag("")
  }
  const handleEditTagOpen = (tag: string) => {
    if (!tag) {
      toast.error("No tag selected")
      return
    }
    setEditingTagNewName(tag)
    editingTagOldName.current = tag
  }
  const OnEditTagSave = () => {
    if (!editingTagNewName || !editingTagOldName.current) {
      toast.error("There is an error in the tag editing")
      return
    }
    updateTag(editingTagOldName.current, editingTagNewName)
    setEditingTagNewName(null)
    editingTagOldName.current = null
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
              size={isMobile ? "icon" : "default"}
            >
              <Sun className={isMobile ? "size-4" : "size-4 mr-2"} />
              {!isMobile && "Light"}
            </Button>
            <Button
              variant={mounted && theme === "dark" ? "default" : "outline"}
              onClick={() => setTheme("dark")}
              className="flex-1"
              size={isMobile ? "icon" : "default"}
            >
              <Moon className={isMobile ? "size-4" : "size-4 mr-2"} />
              {!isMobile && "Dark"}
            </Button>
            <Button
              variant={mounted && theme === "system" ? "default" : "outline"}
              onClick={() => setTheme("system")}
              className="flex-1"
              size={isMobile ? "icon" : "default"}
            >
              <Monitor className={isMobile ? "size-4" : "size-4 mr-2"} />
              {!isMobile && "System"}
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-2">Context Notes</h2>
          <p className="text-sm text-muted-foreground mb-4">
            These notes are always available to the AI as context about you.
          </p>

          {notesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="space-y-2 mb-4">
                {(contextNotes?.data ?? []).map((note) => (
                  <div
                    key={note.id}
                    className="flex items-start gap-2 p-3 rounded-md bg-secondary border-l-4 border-l-primary/50"
                  >
                    <p className="flex-1 text-sm">{note.content}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => handleEditOpen(note)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => setDeletingNoteId(note.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
                {(contextNotes?.data ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No context notes yet
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Textarea
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Add a note about yourself..."
                  className="min-h-[80px] resize-y bg-secondary focus:border-primary focus:outline-none"
                />
              </div>
              <div className="flex justify-end mt-2">
                <Button
                  onClick={() => createNoteMutation.mutate()}
                  disabled={!newNoteContent.trim() || createNoteMutation.isPending}
                  size="sm"
                >
                  {createNoteMutation.isPending ? (
                    <Loader2 className="size-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="size-4 mr-2" />
                  )}
                  Add Note
                </Button>
              </div>
            </>
          )}
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
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => regenerateSummary()}
                  disabled={isRegenerating || isSaving}
                  size={isMobile ? "sm" : "default"}
                >
                  {isRegenerating ? (
                    <Loader2 className="size-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="size-4 mr-2" />
                  )}
                  {isMobile ? "Regenerate" : "Regenerate from Notes"}
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!hasChanges || isSaving || isRegenerating}
                  size={isMobile ? "sm" : "default"}
                >
                  {isSaving && <Loader2 className="size-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </>
          )}
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Quick Tags</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetToDefaults}
              className="text-muted-foreground"
            >
              <RotateCcw className="size-4 mr-2" />
              Reset
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Tags you can quickly add to your notes.
          </p>

          <div className="space-y-2 mb-4">
            {tags.map((tag, index) => (
              <div
                key={typeof tag === "string" ? tag : index}
                className="flex items-center gap-2 p-3 rounded-md bg-secondary"
              >
                <Tag className="size-4 text-primary" />
                <span className="font-medium text-sm">{tag}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => handleEditTagOpen(tag)}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => removeTag(tag)}
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}
            {tags.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No quick tags configured
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Tag name"
              className="flex-1"
            />
            <Button onClick={handleAddTag} disabled={!newTag.trim()} size="icon">
              <Plus className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={editingNote !== null} onOpenChange={(open) => !open && setEditingNote(null)}>
        <DialogContent className="w-[90dvh]">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={editingContent}
              onChange={(e) => setEditingContent(e.target.value)}
              rows={5}
              className="min-h-[120px] focus:border-primary focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingNote(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => updateNoteMutation.mutate()}
                disabled={!editingContent.trim() || updateNoteMutation.isPending}
              >
                {updateNoteMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deletingNoteId !== null}
        onOpenChange={(open) => !open && setDeletingNoteId(null)}
      >
        <DialogContent className="w-[70dvh]">
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-center lg:justify-end gap-2">
            <Button variant="outline" onClick={() => setDeletingNoteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteNoteMutation.mutate()}
              disabled={deleteNoteMutation.isPending}
            >
              {deleteNoteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editingTagNewName !== null}
        onOpenChange={(open) => !open && setEditingTagNewName(null)}
      >
        <DialogContent className="w-[90dvh]">
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={editingTagNewName ?? ""}
              onChange={(e) => setEditingTagNewName(e.target.value)}
              placeholder="Tag name"
              className="flex-1"
            />
            <Button onClick={OnEditTagSave} disabled={!editingTagNewName?.trim()}>
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
