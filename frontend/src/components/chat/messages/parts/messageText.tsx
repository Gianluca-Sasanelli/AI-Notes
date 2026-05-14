"use client"

import DOMPurify from "isomorphic-dompurify"
import { marked } from "marked"
import { memo } from "react"

function toHtml(content: string): string {
  const parsed = marked.parse(content, { async: false })
  const raw = typeof parsed === "string" ? parsed : ""
  const clean = DOMPurify.sanitize(raw, { ADD_ATTR: ["target", "rel"] })
  const withLinks = clean.replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ')
  return withLinks
    .replace(
      /<table/g,
      '<div class="w-0 min-w-full overflow-x-auto rounded-lg border border-border/80"><table'
    )
    .replace(/<\/table>/g, "</table></div>")
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
        <div className="break-words rounded-2xl bg-muted p-2 text-muted-foreground [word-break:break-word]">
          {message}
        </div>
      ) : (
        <div className="w-full min-w-0 overflow-hidden text-base leading-relaxed tracking-wide text-foreground">
          <div
            className={[
              "prose min-w-0 max-w-none break-words [word-break:break-word]",
              "prose-headings:mb-2 prose-headings:mt-4 prose-p:my-2",
              "prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:font-mono prose-code:before:content-none prose-code:after:content-none",
              "prose-pre:bg-muted prose-pre:text-sm",
              "[&_a]:text-primary [&_a]:underline [&_a]:break-all [&_a:hover]:text-primary/80",
              // Table overrides — reset prose spacing
              "[&_table]:w-full [&_table]:text-sm [&_table]:border-collapse [&_table]:m-0 [&_table]:p-0",
              "[&_thead]:bg-secondary [&_thead]:text-secondary-foreground",
              "[&_th]:border-b [&_th]:border-border/60 [&_th]:py-1.5 [&_th]:px-2 [&_th]:align-top [&_th]:font-bold [&_th]:whitespace-nowrap [&_th]:text-left",
              "[&_td]:border-b [&_td]:border-border/30 [&_td]:py-1.5 [&_td]:px-2 [&_td]:align-top [&_td]:whitespace-nowrap"
            ].join(" ")}
          >
            <MemoizedMarkdown content={message} />
          </div>
        </div>
      )}
    </div>
  )
}
