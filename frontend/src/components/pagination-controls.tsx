"use client"

import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/schadcn/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/schadcn/select"
import { cn } from "@/lib/utils"

interface PaginationControlsProps {
  skip: number
  limit: number
  hasNext: boolean
  onParamsChange: (params: { skip?: number; limit?: number }) => void
  className?: string
}

export function PaginationControls({
  skip,
  limit,
  hasNext,
  onParamsChange,
  className
}: PaginationControlsProps) {
  return (
    <div className={cn("flex items-center space-x-4 hidden md:block", className)}>
        <Select
          value={limit.toString()}
          onValueChange={(value) => onParamsChange({ limit: Number(value), skip: 0 })}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 per page</SelectItem>
            {(hasNext || limit >= 25) && <SelectItem value="25">25 per page</SelectItem>}
            {(hasNext || limit >= 50) && <SelectItem value="50">50 per page</SelectItem>}
          </SelectContent>
        </Select>

      <div className="flex items-center gap-3">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onParamsChange({ skip: Math.max(0, skip - limit) })}
            disabled={skip === 0}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onParamsChange({ skip: skip + limit })}
            disabled={!hasNext}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
