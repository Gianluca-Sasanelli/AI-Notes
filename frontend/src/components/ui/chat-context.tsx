"use client"

import { ChevronRight, FileIcon, FolderIcon, Hash, Plus, Search, X } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/schadcn/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/schadcn/popover"
import { Input } from "@/components/ui/schadcn/input"
import { useQuery } from "@tanstack/react-query"
import { getTopics } from "@/lib/api/api-topics"
import { TopicData } from "@/lib/types/database-types"

interface ChatContextPopoverProps {
  disabled?: boolean
  selectedTopicId?: number | null
  onAddFile: () => void
  onSelectTopic: (topic: TopicData) => void
}

export function ChatContextPopover({
  disabled,
  selectedTopicId,
  onAddFile,
  onSelectTopic
}: ChatContextPopoverProps) {
  const [open, setOpen] = useState(false)
  const [topicSubmenuOpen, setTopicSubmenuOpen] = useState(false)
  const { data: topicsData } = useQuery({
    queryKey: ["topics"],
    queryFn: () => getTopics()
  })
  const topics = topicsData?.data ?? []
  return (
    <Popover
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (!isOpen) {
          setTopicSubmenuOpen(false)
        }
      }}
    >
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
      <PopoverContent side="top" align="end" className="w-52 p-1">
        <div className="flex flex-col">
          <button
            onClick={() => {
              onAddFile()
              setOpen(false)
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
          >
            <FileIcon className="size-4" />
            <span>Add file</span>
          </button>

          <Popover open={topicSubmenuOpen} onOpenChange={setTopicSubmenuOpen}>
            <PopoverTrigger asChild>
              <button
                onMouseEnter={() => setTopicSubmenuOpen(true)}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-accent"
              >
                <div className="flex items-center gap-2">
                  <Hash className="size-4" />
                  <span>Add topic</span>
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="right"
              align="start"
              className="w-56 p-2"
              onMouseLeave={() => setTopicSubmenuOpen(false)}
            >
              <div className="flex flex-col gap-2">
                <div className="max-h-40 overflow-y-auto">
                  {topics.length === 0 ? (
                    <p className="px-3 py-2 text-sm text-muted-foreground">No topics found</p>
                  ) : (
                    topics.map((topic) => (
                      <button
                        key={topic.id}
                        onClick={() => {
                          onSelectTopic(topic)
                          setOpen(false)
                          setTopicSubmenuOpen(false)
                        }}
                        className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent ${selectedTopicId === topic.id ? "bg-accent" : ""}`}
                      >
                        <FolderIcon
                          className="size-4"
                          style={{ color: topic.color ?? undefined }}
                        />
                        <span className="truncate">{topic.name}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </PopoverContent>
    </Popover>
  )
}

interface TopicSelectorPopoverProps {
  disabled?: boolean
  selectedTopic?: TopicData | null
  onSelectTopic: (topic: TopicData) => void
  onRemoveTopic: () => void
}

export function TopicSelectorPopover({
  disabled,
  selectedTopic,
  onSelectTopic,
  onRemoveTopic
}: TopicSelectorPopoverProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const { data: topicsData } = useQuery({
    queryKey: ["topics"],
    queryFn: () => getTopics()
  })

  const filteredTopics = useMemo(() => {
    if (!topicsData) return []
    if (!search.trim()) return topicsData.data
    return topicsData.data.filter((topic) =>
      topic.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [topicsData, search])

  if (selectedTopic) {
    return (
      <div className="flex items-center gap-1 rounded-full border bg-muted/50 px-2 py-1 text-sm">
        <FolderIcon className="size-3" style={{ color: selectedTopic.color ?? undefined }} />
        <span className="max-w-24 truncate">{selectedTopic.name}</span>
        <button
          type="button"
          onClick={onRemoveTopic}
          className="ml-1 rounded-full p-0.5 hover:bg-muted"
          disabled={disabled}
        >
          <X className="size-3" />
        </button>
      </div>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-full border border-dashed px-2.5 py-1 text-sm text-muted-foreground hover:border-solid hover:bg-muted/50 hover:text-foreground transition-colors disabled:opacity-50"
          disabled={disabled}
        >
          <Hash className="size-3.5" />
          <span>Add topic</span>
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" align="start" className="w-56 p-2">
        <div className="flex flex-col gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-sm"
            />
          </div>
          <div className="max-h-40 overflow-y-auto">
            {filteredTopics.length === 0 ? (
              <p className="px-3 py-2 text-sm text-muted-foreground">No topics found</p>
            ) : (
              filteredTopics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => {
                    onSelectTopic(topic)
                    setOpen(false)
                    setSearch("")
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
                >
                  <FolderIcon className="size-4" style={{ color: topic.color ?? undefined }} />
                  <span className="truncate">{topic.name}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
