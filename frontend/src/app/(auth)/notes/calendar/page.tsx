"use client"

import { NotesCalendar } from "@/components/notes-calendar"
import { Button } from "@/components/ui/schadcn/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { T } from "gt-react"

export default function NotesCalendarPage() {
  return (
    <div className="w-full max-w-3xl mx-auto py-10 px-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/notes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-primary">
            <T>Calendar</T>
          </h1>
        </div>
      </div>

      <NotesCalendar />
    </div>
  )
}
