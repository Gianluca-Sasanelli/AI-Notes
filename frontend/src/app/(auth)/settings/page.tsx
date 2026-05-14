"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/schadcn/button"
import { Textarea } from "@/components/ui/schadcn/textarea"
import { toast } from "sonner"
import { Loader2, Sun, Moon, Monitor, Plus, Pencil, Trash2, Languages, Info } from "lucide-react"
import {
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
} from "@/components/ui/schadcn/dialog"
import type { TimelessNote } from "@/lib/types/database-types"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/schadcn/tooltip"
import { T, useGT, useLocaleSelector } from "gt-react"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const queryClient = useQueryClient()
  const isMobile = useIsMobile()
  const [mounted, setMounted] = useState(false)

  const [newNoteContent, setNewNoteContent] = useState("")
  const [editingNote, setEditingNote] = useState<TimelessNote | null>(null)
  const [editingContent, setEditingContent] = useState("")
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null)

  const gt = useGT()
  const { locale, locales, setLocale, getLocaleProperties } = useLocaleSelector()

  useEffect(() => {
    queueMicrotask(() => setMounted(true))
  }, [])

  const { data: contextNotes, isLoading: notesLoading } = useQuery({
    queryKey: ["timelessNotes"],
    queryFn: () => getNotesClient({ skip: 0, limit: 100, timeless: true })
  })

  const createNoteMutation = useMutation({
    mutationFn: () => createTimelessNoteClient(newNoteContent.trim()),
    onSuccess: () => {
      toast.success(gt("Note added"))
      setNewNoteContent("")
      queryClient.invalidateQueries({ queryKey: ["timelessNotes"] })
    },
    onError: () => {
      toast.error(gt("Failed to add note"))
    }
  })

  const updateNoteMutation = useMutation({
    mutationFn: () => {
      if (!editingNote) return Promise.reject()
      return updateNoteClient(editingNote._id, {
        content: editingContent.trim()
      })
    },
    onSuccess: () => {
      toast.success(gt("Note updated"))
      setEditingNote(null)
      queryClient.invalidateQueries({ queryKey: ["timelessNotes"] })
    },
    onError: () => {
      toast.error(gt("Failed to update note"))
    }
  })

  const deleteNoteMutation = useMutation({
    mutationFn: () => {
      if (!deletingNoteId) return Promise.reject()
      return deleteNoteClient(deletingNoteId)
    },
    onSuccess: () => {
      toast.success(gt("Note deleted"))
      setDeletingNoteId(null)
      queryClient.invalidateQueries({ queryKey: ["timelessNotes"] })
    },
    onError: () => {
      toast.error(gt("Failed to delete note"))
    }
  })

  const handleEditOpen = (note: TimelessNote) => {
    setEditingContent(note.content)
    setEditingNote(note)
  }

  return (
    <div className="w-full max-w-3xl mx-auto py-10 px-4 min-dvh-screen overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">
          <T>Settings</T>
        </h1>
      </div>

      <div className="space-y-6">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-2">
            <T>Theme</T>
          </h2>
          <div className="flex gap-2">
            <Button
              variant={mounted && theme === "light" ? "default" : "outline"}
              onClick={() => setTheme("light")}
              className="flex-1"
              size={isMobile ? "icon" : "default"}
            >
              <Sun className={isMobile ? "size-4" : "size-4 mr-2"} />
              {!isMobile && <T>Light</T>}
            </Button>
            <Button
              variant={mounted && theme === "dark" ? "default" : "outline"}
              onClick={() => setTheme("dark")}
              className="flex-1"
              size={isMobile ? "icon" : "default"}
            >
              <Moon className={isMobile ? "size-4" : "size-4 mr-2"} />
              {!isMobile && <T>Dark</T>}
            </Button>
            <Button
              variant={mounted && theme === "system" ? "default" : "outline"}
              onClick={() => setTheme("system")}
              className="flex-1"
              size={isMobile ? "icon" : "default"}
            >
              <Monitor className={isMobile ? "size-4" : "size-4 mr-2"} />
              {!isMobile && <T>System</T>}
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-2 flex items-center">
            <Languages className="size-4 mr-2" />
            <T>Language</T>
          </h2>
          <div className="flex gap-2">
            {(locales ?? []).map((loc) => {
              const props = getLocaleProperties(loc)
              return (
                <Button
                  key={loc}
                  variant={mounted && locale === loc ? "default" : "outline"}
                  onClick={() => setLocale(loc)}
                  className="flex-1"
                  size={isMobile ? "icon" : "default"}
                >
                  {isMobile ? (
                    <span className="text-xs">{loc.toUpperCase()}</span>
                  ) : (
                    <>{props.nativeName.charAt(0).toUpperCase() + props.nativeName.slice(1)}</>
                  )}
                </Button>
              )
            })}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-1.5">
            <T>Context Notes</T>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="size-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <T>
                  These notes give the AI context about you — your role, preferences, or anything it
                  should know when helping you.
                </T>
              </TooltipContent>
            </Tooltip>
          </h2>

          {notesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="space-y-2 mb-4">
                {(contextNotes?.data ?? []).map((note) => (
                  <div
                    key={note._id}
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
                      onClick={() => setDeletingNoteId(note._id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
                {(contextNotes?.data ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    <T>No context notes yet</T>
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Textarea
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder={gt("Add a note about yourself...")}
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
                  <T>Add Note</T>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      <Dialog open={editingNote !== null} onOpenChange={(open) => !open && setEditingNote(null)}>
        <DialogContent className="w-[90dvh]">
          <DialogHeader>
            <DialogTitle>
              <T>Edit Note</T>
            </DialogTitle>
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
                <T>Cancel</T>
              </Button>
              <Button
                onClick={() => updateNoteMutation.mutate()}
                disabled={!editingContent.trim() || updateNoteMutation.isPending}
              >
                {updateNoteMutation.isPending ? <T>Saving...</T> : <T>Save</T>}
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
            <DialogTitle>
              <T>Delete Note</T>
            </DialogTitle>
            <DialogDescription>
              <T>This action cannot be undone.</T>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center lg:justify-end gap-2">
            <Button variant="outline" onClick={() => setDeletingNoteId(null)}>
              <T>Cancel</T>
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteNoteMutation.mutate()}
              disabled={deleteNoteMutation.isPending}
            >
              {deleteNoteMutation.isPending ? <T>Deleting...</T> : <T>Delete</T>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
