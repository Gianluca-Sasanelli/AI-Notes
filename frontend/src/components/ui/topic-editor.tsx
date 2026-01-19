"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Circle, X, Plus, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/schadcn/input"
import { Button } from "@/components/ui/schadcn/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/schadcn/dropdown-menu"
import { getTopics } from "@/lib/api"

export type TopicEdit =
  | { id: number; name: string; color: string }
  | { id: null; name: string; color: string }
  | null

const DEFAULT_TOPIC_COLOR = "#3b82f6"

export function TopicEditor({
  value,
  onChange
}: {
  value: TopicEdit
  onChange: (v: TopicEdit) => void
}) {
  const [localColor, setLocalColor] = useState(value?.color ?? "#3b82f6")
  const [localName, setLocalName] = useState(value?.name ?? "")

  const { data: topicsData } = useQuery({
    queryKey: ["topics"],
    queryFn: () => getTopics()
  })
  const topics = topicsData?.data ?? []

  const syncColor = () => {
    if (value) onChange({ ...value, color: localColor })
  }

  const syncName = (name: string) => {
    setLocalName(name)
    if (value) onChange({ ...value, name })
  }

  const selectExistingTopic = (topic: { id: number; name: string; color: string | null }) => {
    setLocalColor(topic.color ?? DEFAULT_TOPIC_COLOR)
    setLocalName(topic.name)
    onChange({ id: topic.id, name: topic.name, color: topic.color ?? DEFAULT_TOPIC_COLOR })
  }

  const startNewTopic = () => {
    setLocalColor(DEFAULT_TOPIC_COLOR)
    setLocalName("")
    onChange({ id: null, name: "", color: DEFAULT_TOPIC_COLOR })
  }

  if (!value) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="h-8 w-full">
            <Plus className="h-3.5 w-3.5 mr-1" />
            Topic
            <ChevronDown className="h-3.5 w-3.5 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem onClick={startNewTopic}>
            <Plus className="h-4 w-4 mr-2" />
            Create new topic
          </DropdownMenuItem>
          {topics.length > 0 && (
            <>
              <DropdownMenuSeparator />
              {topics.map((topic) => (
                <DropdownMenuItem key={topic.id} onClick={() => selectExistingTopic(topic)}>
                  <Circle
                    className="h-4 w-4 mr-2"
                    fill={topic.color ?? undefined}
                    stroke={topic.color ?? undefined}
                  />
                  {topic.name}
                </DropdownMenuItem>
              ))}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div className="flex items-center gap-2 border rounded-md px-3 py-2 w-full">
      <label className="relative w-6 h-6 cursor-pointer">
        <Input
          type="color"
          value={localColor}
          onChange={(e) => setLocalColor(e.target.value)}
          onBlur={syncColor}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        <Circle className="w-6 h-6" fill={localColor} stroke={localColor} />
      </label>
      <Input
        placeholder="Topic name"
        value={localName}
        onChange={(e) => syncName(e.target.value)}
        className="h-8 flex-1 text-sm border-0 focus-visible:ring-0"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => {
          onChange(null)
        }}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
