"use client"

import * as React from "react"
import { CalendarIcon, Clock } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DateTimePickerProps {
  value: Date
  onChange: (date: Date) => void
}

export function DateTimePicker({ value, onChange }: DateTimePickerProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const hours = Array.from({ length: 24 }, (_, i) => i)

  React.useEffect(() => {
    if (scrollRef.current && value) {
      const selectedHour = value.getHours()
      const buttonHeight = 36
      scrollRef.current.scrollTop = selectedHour * buttonHeight - 72
    }
  }, [value])

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return
    const newDate = new Date(date)
    newDate.setHours(value.getHours(), 0, 0, 0)
    onChange(newDate)
  }

  const handleHourSelect = (hour: number) => {
    const newDate = new Date(value)
    newDate.setHours(hour, 0, 0, 0)
    onChange(newDate)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full h-12 justify-between px-4 font-normal hover:bg-accent/50"
        >
          <span className="flex items-center gap-3">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{format(value, "EEE, MMM d, yyyy")}</span>
          </span>
          <span className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="tabular-nums">{format(value, "HH:00")}</span>
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 shadow-lg" align="center">
        <div className="flex divide-x">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleDateSelect}
            autoFocus
            className="p-3"
            captionLayout="dropdown"
            startMonth={new Date(new Date().getFullYear() - 10, 0)}
            endMonth={new Date(new Date().getFullYear() + 1, 11)}
          />
          <div className="w-24 flex flex-col">
            <div className="px-3 py-2 border-b bg-muted/30">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Time
              </span>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto max-h-[280px] p-1">
              {hours.map((hour) => {
                const isSelected = value.getHours() === hour
                return (
                  <button
                    key={hour}
                    onClick={() => handleHourSelect(hour)}
                    className={cn(
                      "w-full h-9 rounded-md text-sm font-medium transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                      isSelected && "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    {hour.toString().padStart(2, "0")}:00
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
