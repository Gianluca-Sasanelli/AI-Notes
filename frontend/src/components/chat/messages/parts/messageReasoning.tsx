import type { ReasoningUIPart } from "ai"

export default function MessageReasoning({ part }: { part: ReasoningUIPart }) {
  return <div className="text-sm text-muted-foreground">{part.text}</div>
}
