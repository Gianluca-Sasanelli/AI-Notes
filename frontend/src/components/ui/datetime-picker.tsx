"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DateRange } from "react-day-picker"
import { useEffect } from "react"
interface DateTimePickerProps {
  startTimestamp: Date
  endTimestamp: Date | null
  onStartChange: (date: Date) => void
  onEndChange: (date: Date | null) => void
}

export function DateTimePicker({
  startTimestamp,
  endTimestamp,
  onStartChange,
  onEndChange
}: DateTimePickerProps) {
  const startScrollRef = React.useRef<HTMLDivElement>(null)
  const endScrollRef = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (startScrollRef.current) {
      const selectedHour = startTimestamp.getHours()
      const buttonHeight = 36
      startScrollRef.current.scrollTop = selectedHour * buttonHeight - 72
    }
  }, [startTimestamp])

  useEffect(() => {
    if (endScrollRef.current && endTimestamp) {
      const selectedHour = endTimestamp.getHours()
      const buttonHeight = 36
      endScrollRef.current.scrollTop = selectedHour * buttonHeight - 72
    }
  }, [endTimestamp])

  const handleRangeSelect = (range: DateRange | undefined) => {
    console.log("range", range)
    if (!range) return
    if (range.from) {
      const newStart = new Date(range.from)
      newStart.setHours(startTimestamp.getHours(), 0, 0, 0)
      onStartChange(newStart)
    }
    if (range.to) {
      const newEnd = new Date(range.to)
      newEnd.setHours(endTimestamp?.getHours() ?? 23, 0, 0, 0)
      onEndChange(newEnd)
    } else {
      onEndChange(null)
    }
  }

  const formatDisplay = () => {
    const startStr = format(startTimestamp, "MMM d")
    if (endTimestamp) {
      const endStr = format(endTimestamp, "MMM d")
      return `${startStr} → ${endStr}`
    }
    return startStr
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full h-12 justify-start px-4 font-normal hover:bg-accent/50"
        >
          <CalendarIcon className="h-4 w-4 text-muted-foreground mr-3" />
          <span className="font-medium">{formatDisplay()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="bg-secondary text-secondary-foreground w-full shadow-lg"
        align="center"
      >
        <Calendar
          mode="range"
          selected={{ from: startTimestamp, to: endTimestamp ?? undefined }}
          onSelect={handleRangeSelect}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}
