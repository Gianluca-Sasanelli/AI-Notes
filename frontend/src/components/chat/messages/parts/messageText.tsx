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
    p: { props: { className: "mb-5 break-words" } },
    ul: { props: { className: "list-disc my-6 space-y-2 max-w-full" } },
    ol: { props: { className: "list-decimal my-6 space-y-2 max-w-full" } },
    li: { props: { className: "my-2 list-disc break-words" } },
    strong: { props: { className: "font-semibold break-words" } },
    em: { props: { className: "italic break-words" } },
    code: {
      props: {
        className: "rounded bg-muted px-1 py-0.5 text-sm font-mono break-all inline-block"
      }
    },
    pre: {
      props: {
        className: "mb-6 rounded bg-muted p-4 text-sm overflow-x-auto"
      }
    },
    h1: { props: { className: "text-2xl font-bold mb-2 mt-4" } },
    h2: { props: { className: "text-xl font-bold mb-2 mt-4" } },
    h3: { props: { className: "text-lg font-semibold mb-2 mt-4" } },
    blockquote: {
      props: {
        className:
          "pl-6 pr-4 border-l-4 border-primary bg-primary/5 py-3 italic my-6 rounded-r-md text-muted-foreground"
      }
    },
    table: {
      props: {
        className: "my-6 w-full border-collapse overflow-hidden rounded-lg border border-border"
      }
    },
    thead: { props: { className: "bg-muted" } },
    th: {
      props: {
        className: "border border-border px-4 py-2 text-left text-sm font-semibold"
      }
    },
    td: {
      props: {
        className: "border border-border px-4 py-2 text-sm"
      }
    },
    tr: { props: { className: "even:bg-muted/50" } }
  }
}

export default function MessageUI({ message, isUser }: { message: string; isUser: boolean }) {
  // A "" message even if not visible ruin the UI
  if (message === "") return null
  return (
    <div>
      {isUser ? (
        <div className="break-words rounded-2xl border bg-muted p-2 text-base text-muted-foreground [word-break:break-word]">
          {message}
        </div>
      ) : (
        <div className="min-w-0 max-w-full overflow-hidden rounded-2xl p-4 text-base leading-relaxed tracking-wide text-foreground">
          <div className="break-words [word-break:break-word]">
            <Markdown options={markdownOptions}>{message}</Markdown>
          </div>
        </div>
      )}
    </div>
  )
}
