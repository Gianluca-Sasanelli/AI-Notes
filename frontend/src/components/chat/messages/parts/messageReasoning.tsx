"use client"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/schadcn/collapsible"
import type { ReasoningUIPart } from "ai"
import DOMPurify from "isomorphic-dompurify"
import { marked } from "marked"
import { ChevronRight, Brain } from "lucide-react"
import { memo, useState, useRef, useEffect } from "react"

function toReasoningHtml(content: string): string {
  const raw = marked.parse(content, { async: false }) as string
  const clean = DOMPurify.sanitize(raw, { ADD_ATTR: ["target", "rel"] })
  return clean.replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ')
}

const MemoizedReasoningMarkdown = memo(
  function MemoizedReasoningMarkdown({ content }: { content: string }) {
    return (
      <div className="contents" dangerouslySetInnerHTML={{ __html: toReasoningHtml(content) }} />
    )
  },
  (prevProps, nextProps) => prevProps.content === nextProps.content
)

export default function MessageReasoning({ part }: { part: ReasoningUIPart }) {
  const [isOpen, setIsOpen] = useState(false)
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
      <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
        <ChevronRight className={`size-4 transition-transform ${isOpen ? "rotate-90" : ""}`} />
        <Brain className="size-4" />
        <span className="font-medium">
          Reasoning
          {thinkingTime !== null && part.state === "done" && (
            <span className="ml-2 text-xs text-muted-foreground">
              (thought for {thinkingTime}s)
            </span>
          )}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-5 pt-2">
        <div className="[&_a:hover]:text-info/80 prose prose-sm max-w-none prose-headings:mb-1 prose-headings:mt-2 prose-headings:text-sm prose-headings:text-muted-foreground prose-p:mb-1 prose-p:whitespace-normal prose-p:text-muted-foreground prose-strong:text-muted-foreground prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:font-mono prose-code:text-xs prose-code:before:content-none prose-code:after:content-none prose-pre:my-2 prose-pre:bg-muted prose-pre:p-3 prose-pre:text-xs prose-li:text-muted-foreground [&_a]:break-all [&_a]:text-info [&_a]:underline">
          <MemoizedReasoningMarkdown content={part.text} />
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
