import { AiFrontendTools } from "@/lib/types/chat-types"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/schadcn/collapsible"
import { ChevronRight, Loader2, Blocks } from "lucide-react"
import { useState } from "react"

type ToolState = "input-streaming" | "input-available" | "output-available" | "output-error"

export default function ToolCallWidget({
  toolName,
  state
}: {
  toolName: string
  state: ToolState
}) {
  const [isOpen, setIsOpen] = useState(false)
  const isLoading = state === "input-streaming" || state === "input-available"

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="my-2">
      <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
        <ChevronRight className={`size-4 transition-transform ${isOpen ? "rotate-90" : ""}`} />
        <Blocks className="size-4" />
        <span className="font-medium">Tool call</span>
        {isLoading && <Loader2 className="size-4 animate-spin ml-1" />}
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-5 pt-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{AiFrontendTools[toolName]?.icon}</span>
          <span>{AiFrontendTools[toolName]?.title ?? toolName}</span>
          {state === "output-available" && <span className="text-green-500">✓</span>}
          {state === "output-error" && <span className="text-red-500">✗</span>}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
