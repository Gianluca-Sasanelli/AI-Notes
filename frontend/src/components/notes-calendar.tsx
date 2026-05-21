"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Calendar, CalendarDayButton } from "@/components/ui/schadcn/calendar"
import { getNotesByDateRangeClient } from "@/lib/api"
import { TimeNote } from "@/lib/types/database-types"
import { format, startOfDay, addDays, isSameDay, startOfMonth, endOfMonth } from "date-fns"
import Link from "next/link"
import { Card } from "@/components/ui/schadcn/card"
import { Calendar as CalendarIcon, Circle, Paperclip, FileText } from "lucide-react"
import { formatTimestampRange } from "@/lib/notes-utils"
import { Skeleton } from "@/components/ui/schadcn/skeleton"
import { T, Var } from "gt-react"

export function NotesCalendar() {
  const [selectedDay, setSelectedDay] = useState<Date>(new Date())
  const [month, setMonth] = useState<Date>(new Date())

  const from = startOfMonth(month).getTime()
  const to = endOfMonth(month).getTime()

  const {
    data: notes = [],
    isLoading,
    isError
  } = useQuery({
    queryKey: ["notes-calendar", from, to],
    queryFn: () => getNotesByDateRangeClient(from, to)
  })
  console.log("The notes are", notes)
  type DayNoteInfo = { note: TimeNote; position: "single" | "start" | "middle" | "end" }

  const notesByDay = useMemo(() => {
    const map = new Map<string, DayNoteInfo[]>()
    for (const note of notes) {
      const start = startOfDay(new Date(note.startTimestamp))
      const end = note.endTimestamp ? startOfDay(new Date(note.endTimestamp)) : start
      let current = start
      while (current <= end) {
        const dayKey = format(current, "yyyy-MM-dd")
        const isStart = isSameDay(current, start)
        const isEnd = isSameDay(current, end)
        const position = isStart && isEnd ? "single" : isStart ? "start" : isEnd ? "end" : "middle"
        const existing = map.get(dayKey) ?? []
        existing.push({ note, position })
        map.set(dayKey, existing)
        current = addDays(current, 1)
      }
    }
    return map
  }, [notes])

  const daysWithNotes = useMemo(
    () => Array.from(notesByDay.keys()).map((key) => new Date(key + "T00:00:00")),
    [notesByDay]
  )

  const selectedDayKey = format(selectedDay, "yyyy-MM-dd")
  const selectedDayNotes = notesByDay.get(selectedDayKey) ?? []

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[320px] w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    )
  }

  if (isError && notes.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <FileText className="mx-auto mb-3 h-10 w-10 text-destructive" />
          <p className="text-destructive">
            <T>Failed to load notes</T>
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="p-4 [&_[data-slot=calendar]]:w-full [&_table]:w-full [&_.rdp-day]:aspect-auto [&_.rdp-day_button]:aspect-auto [&_.rdp-day_button]:h-8 [&_.rdp-week]:mt-1 [&_.rdp-month]:gap-2">
        <Calendar
          mode="single"
          selected={selectedDay}
          onSelect={(day) => day && setSelectedDay(day)}
          month={month}
          onMonthChange={setMonth}
          modifiers={{
            hasNotes: daysWithNotes
          }}
          components={{
            DayButton: ({ day, modifiers, ...props }) => {
              const dayKey = format(day.date, "yyyy-MM-dd")
              const dayInfos = notesByDay.get(dayKey)
              const info = dayInfos?.find((i) => i.note.topic)
              const topicColor = info?.note.topic?.color
              const position = info?.position
              const roundedClass =
                position === "start"
                  ? "rounded-l-md rounded-r-none"
                  : position === "end"
                    ? "rounded-r-md rounded-l-none"
                    : position === "middle"
                      ? "rounded-none"
                      : undefined
              return (
                <CalendarDayButton
                  day={day}
                  modifiers={modifiers}
                  {...props}
                  className={roundedClass}
                  style={
                    topicColor && !modifiers.selected
                      ? { backgroundColor: topicColor, color: "white" }
                      : undefined
                  }
                />
              )
            }
          }}
        />
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-3">{format(selectedDay, "EEEE, MMMM d, yyyy")}</h2>

        {selectedDayNotes.length === 0 ? (
          <Card className="p-8">
            <p className="text-center text-muted-foreground text-sm">
              <T>No notes on this day</T>
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {selectedDayNotes.map(({ note }) => (
              <Link key={note._id} href={`/note/${note._id}`} className="block">
                <Card
                  className="p-4 transition-colors hover:brightness-110 mb-3 w-full"
                  style={note.topic ? { backgroundColor: `${note.topic.color}20` } : undefined}
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <CalendarIcon className="h-4 w-4" />
                        {formatTimestampRange(
                          new Date(note.startTimestamp),
                          note.endTimestamp ? new Date(note.endTimestamp) : null,
                          note.granularity
                        )}
                      </span>
                      {note.topic && (
                        <span className="flex items-center gap-1.5">
                          <Circle
                            className="h-3 w-3"
                            fill={note.topic.color}
                            stroke={note.topic.color}
                          />
                          {note.topic.name}
                        </span>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed">{note.content}</p>
                    {note.files && note.files.length > 0 && (
                      <div className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
                        <Paperclip className="h-3 w-3" />
                        {note.files.length <= 2 ? (
                          <span>{note.files.join(", ")}</span>
                        ) : (
                          <T>
                            <span>
                              <Var>{note.files.length}</Var> files
                            </span>
                          </T>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
