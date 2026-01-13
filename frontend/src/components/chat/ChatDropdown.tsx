"use client"

import { Pencil, Trash2 } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { deleteChatClient, updateChatClient } from "@/lib/api"
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
  const [newTitle, setNewTitle] = useState(currentTitle)
  const router = useRouter()
  const pathname = usePathname()
  const queryClient = useQueryClient()

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

  const handleDelete = () => {
    const isCurrentChat = pathname === `/chat/${chatId}`

    deleteChatMutation(chatId, {
      onSuccess: () => {
        if (isCurrentChat) {
          router.push("/chat")
        }
      }
    })
  }

  return (
    <>
      <div className={`flex items-center ${className}`}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button onClick={() => setIsRenameOpen(true)} className="p-2 rounded">
              <Pencil className={`${iconsize} shrink-0 text-muted-foreground`} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Rename</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleDelete}
              disabled={isDeletingChat}
              className="p-2 rounded"
            >
              <Trash2 className={`${iconsize} shrink-0 text-destructive`} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Delete</TooltipContent>
        </Tooltip>
      </div>

      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent className="max-w-[50vw]">
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
    </>
  )
}
