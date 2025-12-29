import { format } from "date-fns"
import type { NoteGranularity } from "@/lib/types/database-types"

export const getFormatPattern = (granularity: NoteGranularity) => {
  switch (granularity) {
    case "hour":
      return "MMM d, HH:00"
    case "day":
      return "EEE, MMM d"
    case "month":
      return "MMMM yyyy"
  }
}

export const formatTimestampRange = (
  startTimestamp: Date,
  endTimestamp: Date | null,
  granularity: NoteGranularity
) => {
  const pattern = getFormatPattern(granularity)
  const startStr = format(startTimestamp, pattern)
  if (endTimestamp) {
    const endStr = format(endTimestamp, pattern)
    return `${startStr} → ${endStr}`
  }
  return startStr
}
