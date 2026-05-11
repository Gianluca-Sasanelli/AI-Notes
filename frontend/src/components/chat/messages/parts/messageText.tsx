"use client"

import DOMPurify from "isomorphic-dompurify"
import { marked } from "marked"
import { memo } from "react"

function toHtml(content: string): string {
  const parsed = marked.parse(content, { async: false })
  const raw = typeof parsed === "string" ? parsed : ""
  const clean = DOMPurify.sanitize(raw, { ADD_ATTR: ["target", "rel"] })
  return clean.replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ')
}

const MemoizedMarkdown = memo(
  function MemoizedMarkdown({ content }: { content: string }) {
    return <div className="contents" dangerouslySetInnerHTML={{ __html: toHtml(content) }} />
  },
  (prevProps, nextProps) => prevProps.content === nextProps.content
)

export default function MessageUI({
  message,
  isUser
}: {
  message: string
  isUser: boolean
  id?: string
}) {
  if (message === "") return null
  return (
    <div className={isUser ? "flex justify-end" : ""}>
      {isUser ? (
        <div className="break-words rounded-2xl border bg-muted p-2 text-muted-foreground [word-break:break-word]">
          {message}
        </div>
      ) : (
        <div className="w-full min-w-0 overflow-hidden text-base leading-relaxed tracking-wide text-foreground">
          <div className="[&_a:hover]:text-info/80 prose min-w-0 max-w-none break-words [word-break:break-word] prose-headings:mb-2 prose-headings:mt-4 prose-p:my-2 prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:font-mono prose-code:before:content-none prose-code:after:content-none prose-pre:bg-muted prose-pre:text-sm [&_a]:break-all [&_a]:text-info [&_a]:underline">
            <MemoizedMarkdown content={message} />
          </div>
        </div>
      )}
    </div>
  )
}
