"use client"

import { MoreHorizontal } from "lucide-react"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { deleteChatClient, updateChatClient } from "@/lib/api"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

interface ChatDropdownProps {
  chatId: string
  currentTitle: string
  dropdownsize?: "md" | "lg"
  iconsize?: "size-6" | "size-8"
  className?: string
}

export function ChatDropdown({
  chatId,
  currentTitle,
  dropdownsize = "md",
  iconsize = "size-6",
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
      <DropdownMenu>
        <DropdownMenuTrigger data-testid="chat-options-btn">
          <MoreHorizontal
            className={`${iconsize} shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 ${className}`}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            data-testid="chat-rename"
            onClick={() => setIsRenameOpen(true)}
            className="cursor-pointer text-lg"
          >
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            data-testid="chat-delete"
            className="cursor-pointer text-lg text-destructive"
            onClick={handleDelete}
            disabled={isDeletingChat}
          >
            {isDeletingChat ? "Deleting..." : "Delete"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
