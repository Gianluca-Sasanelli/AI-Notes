"use client"

import { NotesList } from "@/components/notes-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function NotesPage() {
  return (
    <div className="w-full max-w-3xl mx-auto py-10 px-4 overflow-y-auto h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary">Your Notes</h1>
        </div>
        <Button asChild>
          <Link href="/new">
            <Plus className="h-4 w-4 mr-2" />
            New Note
          </Link>
        </Button>
      </div>

      <NotesList />
    </div>
  )
}
