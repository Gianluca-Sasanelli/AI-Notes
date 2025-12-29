"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { DateRange } from "react-day-picker"
import type { NoteGranularity } from "@/lib/types/database-types"
import { cn } from "@/lib/utils"
import { formatTimestampRange } from "@/lib/notes-utils"
import { useIsMobile } from "@/lib/hooks"

interface DateTimePickerProps {
  startTimestamp: Date
  endTimestamp: Date | null
  onStartChange: (date: Date) => void
  onEndChange: (date: Date | null) => void
  granularity: NoteGranularity
  onGranularityChange: (granularity: NoteGranularity) => void
}

const isSameTimestamp = (date1: Date, date2: Date, granularity: NoteGranularity = "day") => {
  const isSameYear = date1.getFullYear() === date2.getFullYear()
  if (!isSameYear) return false

  const isSameMonth = date1.getMonth() === date2.getMonth()
  const isSameDay = date1.getDate() === date2.getDate()
  const isSameHour = date1.getHours() === date2.getHours()
  switch (granularity) {
    case "month":
      return isSameMonth
    case "day":
      return isSameDay && isSameMonth
    case "hour":
      return isSameHour && isSameDay && isSameMonth
  }
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)

const GRANULARITY_OPTIONS = [
  { value: "hour", label: "Hour" },
  { value: "day", label: "Day" },
  { value: "month", label: "Month" }
]

export function DateTimePicker({
  startTimestamp,
  endTimestamp,
  onStartChange,
  onEndChange,
  granularity,
  onGranularityChange
}: DateTimePickerProps) {
  const isMobile = useIsMobile()

  const handleRangeSelect = (range: DateRange | undefined) => {
    if (!range) return
    const RangeFrom = range?.from ? new Date(range.from) : null

    let RangeTo: Date | null = range?.to ? new Date(range.to) : null
    if (RangeTo && RangeFrom && isSameTimestamp(RangeTo, RangeFrom, granularity)) {
      RangeTo = null
    }
    if (RangeFrom) {
      onStartChange(RangeFrom)
    }

    onEndChange(RangeTo)
  }

  const handleHourChange = (hour: number, isEnd: boolean) => {
    if (isEnd) {
      const newEnd = endTimestamp ? new Date(endTimestamp) : new Date(startTimestamp)
      newEnd.setHours(hour, 0, 0, 0)
      onEndChange(newEnd)
    } else {
      const newStart = new Date(startTimestamp)
      newStart.setHours(hour, 0, 0, 0)
      onStartChange(newStart)
    }
  }

  const granularityToggle = (
    <div className="flex rounded-md border border-input overflow-hidden w-fit">
      {GRANULARITY_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onGranularityChange(option.value as NoteGranularity)}
          className={cn(
            "px-3 py-1.5 text-sm transition-colors",
            granularity === option.value ? "bg-primary text-primary-foreground" : "hover:bg-accent"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )

  const triggerButton = (
    <Button
      variant="outline"
      className="w-full h-12 justify-start px-4 font-normal hover:bg-accent/50"
    >
      <CalendarIcon className="h-4 w-4 text-muted-foreground mr-3" />
      <span className="font-medium">
        {formatTimestampRange(startTimestamp, endTimestamp, granularity)}
      </span>
    </Button>
  )

  if (isMobile) {
    return (
      <div className="flex flex-col gap-2 w-full">
        {granularityToggle}
        <Sheet>
          <SheetTrigger asChild>{triggerButton}</SheetTrigger>
          <SheetContent side="bottom" className="px-0 pb-8">
            <SheetTitle className="sr-only">Select date</SheetTitle>
            <div className="flex flex-col items-center overflow-auto max-h-[70vh]">
              <Calendar
                mode="range"
                selected={{ from: startTimestamp, to: endTimestamp ?? undefined }}
                onSelect={handleRangeSelect}
                captionLayout="dropdown-years"
                className="p-3"
              />
              {granularity === "hour" && (
                <div className="flex border-t w-full">
                  <div className="flex flex-col flex-1">
                    <div className="px-3 py-2 text-xs text-muted-foreground border-b text-center">
                      Start
                    </div>
                    <div className="h-[120px] overflow-y-auto">
                      {HOURS.map((hour) => (
                        <button
                          key={hour}
                          type="button"
                          onClick={() => handleHourChange(hour, false)}
                          className={cn(
                            "w-full px-4 py-3 text-sm text-center",
                            startTimestamp.getHours() === hour &&
                              "bg-primary text-primary-foreground"
                          )}
                        >
                          {hour.toString().padStart(2, "0")}:00
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col flex-1 border-l">
                    <div className="px-3 py-2 text-xs text-muted-foreground border-b text-center">
                      End
                    </div>
                    <div className="h-[120px] overflow-y-auto">
                      {HOURS.map((hour) => (
                        <button
                          key={hour}
                          type="button"
                          onClick={() => handleHourChange(hour, true)}
                          className={cn(
                            "w-full px-4 py-3 text-sm text-center",
                            endTimestamp?.getHours() === hour &&
                              "bg-primary text-primary-foreground"
                          )}
                        >
                          {hour.toString().padStart(2, "0")}:00
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      {granularityToggle}
      <Popover>
        <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
        <PopoverContent
          className="bg-secondary text-secondary-foreground w-auto shadow-lg p-0"
          align="center"
        >
          <div className="flex">
            <Calendar
              mode="range"
              selected={{ from: startTimestamp, to: endTimestamp ?? undefined }}
              onSelect={handleRangeSelect}
              autoFocus
              captionLayout="dropdown-years"
              className="p-3"
            />
            {granularity === "hour" && (
              <div className="flex border-l max-w-[70dvh]">
                <div className="flex flex-col">
                  <div className="px-3 py-2 text-xs text-muted-foreground border-b">Start</div>
                  <div className="h-[280px] overflow-y-auto">
                    {HOURS.map((hour) => (
                      <button
                        key={hour}
                        type="button"
                        onClick={() => handleHourChange(hour, false)}
                        className={cn(
                          "w-full px-4 py-2 text-sm text-left",
                          startTimestamp.getHours() === hour && "bg-primary text-primary-foreground"
                        )}
                      >
                        {hour.toString().padStart(2, "0")}:00
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col border-l">
                  <div className="px-3 py-2 text-xs text-muted-foreground border-b">End</div>
                  <div className="h-[280px] overflow-y-auto">
                    {HOURS.map((hour) => (
                      <button
                        key={hour}
                        type="button"
                        onClick={() => handleHourChange(hour, true)}
                        className={cn(
                          "w-full px-4 py-2 text-sm text-left",
                          endTimestamp?.getHours() === hour && "bg-primary text-primary-foreground"
                        )}
                      >
                        {hour.toString().padStart(2, "0")}:00
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
