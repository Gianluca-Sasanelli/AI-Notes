"use client"

import { useQuery } from "@tanstack/react-query"
import { Circle } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/schadcn/select"
import { getTopics } from "@/lib/api"

interface TopicSelectorProps {
  value: number | null
  onChange: (topicId: number | null) => void
}

export function TopicSelector({ value, onChange }: TopicSelectorProps) {
  const { data: topicsData } = useQuery({
    queryKey: ["topics"],
    queryFn: () => getTopics()
  })
  const topics = topicsData?.data ?? []

  return (
    <Select
      value={value?.toString() ?? "all"}
      onValueChange={(v) => onChange(v === "all" ? null : Number(v))}
    >
      <SelectTrigger className="w-[180px] rounded-md">
        <SelectValue placeholder="All topics" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All topics</SelectItem>
        {topics.map((topic) => (
          <SelectItem key={topic.id} value={topic.id.toString()}>
            <span className="flex items-center gap-2">
              <Circle
                className="h-3 w-3"
                fill={topic.color ?? undefined}
                stroke={topic.color ?? undefined}
              />
              {topic.name}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
