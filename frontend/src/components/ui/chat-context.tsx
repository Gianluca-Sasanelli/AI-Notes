"use client"

import { FileIcon, Plus } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/schadcn/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/schadcn/popover"

interface ChatContextPopoverProps {
  disabled?: boolean
  onAddFile: () => void
}

export function ChatContextPopover({ disabled, onAddFile }: ChatContextPopoverProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-md text-foreground"
          disabled={disabled}
          title="Add to context"
        >
          <Plus className="size-6" />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" align="end" className="w-48 p-1">
        <button
          onClick={() => {
            onAddFile()
            setOpen(false)
          }}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
        >
          <FileIcon className="size-4" />
          <span>Add File</span>
        </button>
      </PopoverContent>
    </Popover>
  )
}
