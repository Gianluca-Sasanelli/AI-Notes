"use client"

import { Pencil, Trash2 } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/schadcn/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/schadcn/dialog"
import { Input } from "@/components/ui/schadcn/input"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/schadcn/tooltip"
import { deleteChatClient, updateChatClient } from "@/lib/api"
import { useIsMobile } from "@/lib/hooks"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

interface ChatDropdownProps {
  chatId: string
  currentTitle: string
  dropdownsize?: "md" | "lg"
  iconsize?: "size-4" | "size-5"
  className?: string
}

export function ChatDropdown({
  chatId,
  currentTitle,
  dropdownsize = "md",
  iconsize = "size-4",
  className
}: ChatDropdownProps) {
  const [isRenameOpen, setIsRenameOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [newTitle, setNewTitle] = useState(currentTitle)
  const router = useRouter()
  const pathname = usePathname()
  const queryClient = useQueryClient()
  const isMobile = useIsMobile()

  const { mutate: updateChatMutation, isPending: isUpdatingChat } = useMutation({
    mutationFn: ({ chatId, title }: { chatId: string; title: string }) =>
      updateChatClient(chatId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] })
      toast.success("Chat renamed")
    },
    onError: () => {
      toast.error("Failed to rename chat")
    }
  })

  const { mutate: deleteChatMutation, isPending: isDeletingChat } = useMutation({
    mutationFn: (chatId: string) => deleteChatClient(chatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] })
      toast.success("Chat deleted")
    },
    onError: () => {
      toast.error("Failed to delete chat")
    }
  })

  const handleRename = () => {
    updateChatMutation(
      { chatId, title: newTitle },
      {
        onSuccess: () => {
          setIsRenameOpen(false)
        }
      }
    )
  }

  const confirmDelete = () => {
    const isCurrentChat = pathname === `/chat/${chatId}`

    deleteChatMutation(chatId, {
      onSuccess: () => {
        setIsDeleteOpen(false)
        if (isCurrentChat) {
          router.push("/chat")
        }
      }
    })
  }

  return (
    <>
      <div className={`flex items-center bg-primary-muted rounded-md p-1 ${className}`}>
        {isMobile ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsRenameOpen(true)}
              className="p-2 rounded"
            >
              <Pencil className={`${iconsize} shrink-0 text-muted-foreground`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDeleteOpen(true)}
              disabled={isDeletingChat}
              className="p-2 rounded"
            >
              <Trash2 className={`${iconsize} shrink-0 text-destructive`} />
            </Button>
          </>
        ) : (
          <>
            <Tooltip disableHoverableContent={true}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsRenameOpen(true)}
                  className="p-2 rounded"
                >
                  <Pencil className={`${iconsize} shrink-0 text-muted-foreground`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Rename</TooltipContent>
            </Tooltip>
            <Tooltip disableHoverableContent={true}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsDeleteOpen(true)}
                  disabled={isDeletingChat}
                  className="p-2 rounded"
                >
                  <Trash2 className={`${iconsize} shrink-0 text-destructive`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Delete</TooltipContent>
            </Tooltip>
          </>
        )}
      </div>

      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent className="min-w-[30vw] max-w-[70vw]">
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
          </DialogHeader>
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Enter new title"
            className={`${dropdownsize === "lg" ? "text-lg" : ""}`}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRename} disabled={isUpdatingChat}>
              {isUpdatingChat ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="min-w-[30vw] max-w-[70vw]">
          <DialogHeader>
            <DialogTitle>Delete Chat</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete this chat? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeletingChat}>
              {isDeletingChat ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
