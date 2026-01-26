import type { ReactNode } from "react"
import Markdown from "markdown-to-jsx"

const markdownOptions = {
  overrides: {
    a: {
      props: {
        className: "underline text-info hover:text-info/80 break-all",
        target: "_blank",
        rel: "noopener noreferrer"
      }
    },
    p: { props: { className: "whitespace-normal break-words" } },
    ul: { props: { className: "list-disc my-2 pl-6 max-w-full" } },
    ol: { props: { className: "list-decimal my-2 pl-6 max-w-full" } },
    li: { props: { className: "whitespace-normal break-words" } },
    strong: { props: { className: "font-semibold break-words" } },
    em: { props: { className: "italic break-words" } },
    code: {
      props: {
        className: "rounded bg-muted px-1 py-0.5 text-sm font-mono break-all inline-block"
      }
    },
    pre: {
      props: {
        className: "mb-6 rounded bg-muted p-4 text-sm overflow-x-auto "
      }
    },
    h1: { props: { className: "text-2xl font-bold mb-2 mt-4" } },
    h2: { props: { className: "text-xl font-bold mb-2 mt-4" } },
    h3: { props: { className: "text-lg font-semibold mb-2 mt-4" } },
    hr: { props: { className: "hidden" } },
    blockquote: {
      props: {
        className:
          "pl-6 pr-4 border-l-4 border-primary bg-primary/5 py-3 italic my-6 rounded-r-md text-muted-foreground"
      }
    },
    table: {
      component: ({ children }: { children: ReactNode }) => (
        <div className="my-4 w-0 min-w-full overflow-x-auto rounded-lg border border-border/80">
          <table className="w-full text-sm">{children}</table>
        </div>
      )
    },
    thead: {
      props: { className: "bg-secondary text-secondary-foreground px-2 whitespace-nowrap" }
    },
    th: {
      props: {
        className: "border-b border-border/60 py-2 px-2 align-top font-bold whitespace-nowrap"
      }
    },
    td: {
      props: {
        className: "border-b border-border/30 py-2 px-2 align-top whitespace-nowrap"
      }
    },
    tr: { props: {} }
  }
}

export default function MessageUI({ message, isUser }: { message: string; isUser: boolean }) {
  // A "" message even if not visible ruin the UI
  if (message === "") return null
  return (
    <div className={isUser ? "flex justify-end" : ""}>
      {isUser ? (
        <div className="break-words rounded-2xl border bg-muted p-2  text-muted-foreground [word-break:break-word]">
          {message}
        </div>
      ) : (
        <div className="min-w-0 w-full overflow-hidden text-base leading-relaxed tracking-wide text-foreground">
          <div className="min-w-0 max-w-full break-words [word-break:break-word]">
            <Markdown options={markdownOptions}>{message}</Markdown>
          </div>
        </div>
      )}
    </div>
  )
}
