import type { ReasoningUIPart } from "ai"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronRight } from "lucide-react"
import { useState } from "react"

export default function MessageReasoning({ part }: { part: ReasoningUIPart }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="my-2">
      <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer ">
        <ChevronRight className={`size-4 transition-transform ${isOpen ? "rotate-90" : ""}`} />
        <span className="font-medium">Reasoning</span>
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-5 pt-2">
        <div className="text-sm text-muted-foreground whitespace-pre-wrap">{part.text}</div>
      </CollapsibleContent>
    </Collapsible>
  )
}
