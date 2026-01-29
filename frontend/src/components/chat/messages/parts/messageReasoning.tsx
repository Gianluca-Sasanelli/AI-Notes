import type { ReasoningUIPart } from "ai"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/schadcn/collapsible"
import { ChevronRight, Brain } from "lucide-react"
import { useState, useRef, useEffect } from "react"

export default function MessageReasoning({
  part
}: {
  part: ReasoningUIPart 
}) {
  const [isOpen, setIsOpen] = useState(false)
  console.log("part", part)
  const [thinkingTime, setThinkingTime] = useState<number | null>(null)

  const initialTime = useRef<number | null>(null)

  useEffect(() => {
    if (part.state === "streaming" && initialTime.current === null) {
      initialTime.current = Date.now()
    } else if (part.state === "done" && initialTime.current !== null) {
      setThinkingTime(Math.round((Date.now() - initialTime.current) / 1000))
      initialTime.current = null
    
    }
  }, [part.state])

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="my-2">
      <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer ">
        <ChevronRight className={`size-4 transition-transform ${isOpen ? "rotate-90" : ""}`} />
        <Brain className="size-4" />
        <span className="font-medium">
          Reasoning
          {thinkingTime !== null && (
            <span className="ml-2 text-xs text-muted-foreground">
              (thought for {thinkingTime}s)
            </span>
          )}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-5 pt-2">
        <div className="text-sm text-muted-foreground whitespace-pre-wrap">{part.text}</div>
      </CollapsibleContent>
    </Collapsible>
  )
}
