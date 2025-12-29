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
const isSameDay = (date1: Date, date2: Date) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
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
    if (!range) return
    const RangeFrom = range?.from ? new Date(range.from) : null

    let RangeTo: Date | null = range?.to ? new Date(range.to) : null
    if (RangeTo && RangeFrom && isSameDay(RangeTo, RangeFrom)) {
      RangeTo = null
    }
    console.log("RangeTo", RangeTo)
    console.log("RangeFrom", RangeFrom)
    if (RangeFrom) {
      onStartChange(RangeFrom)
    }

    onEndChange(RangeTo)
  }

  const formatDisplay = () => {
    const startStr = format(startTimestamp, "MMM d")
    if (endTimestamp) {
      console.log("endTimestamp", endTimestamp)
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
          captionLayout="dropdown-years"
        />
      </PopoverContent>
    </Popover>
  )
}
