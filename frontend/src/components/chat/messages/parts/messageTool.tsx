export default function ToolCallWidget({
  toolName,
  state
}: {
  toolName: string
  state: "input-streaming" | "input-available" | "output-available" | "output-error"
}) {
  let icon = null
  if (state === "output-error") {
    icon = <span className="ml-2 text-xl text-error">✗</span>
  } else if (state === "output-available") {
    icon = <span className="ml-2 text-xl text-success">✓</span>
  } else if (state === "input-streaming" || state === "input-available") {
    icon = (
      <span className="ml-2 flex h-4 w-4 items-center justify-center">
        <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-secondary-foreground border-t-transparent" />
      </span>
    )
  }
  return (
    <div className="flex h-20 w-[50%] items-center justify-center rounded-md bg-secondary p-4 text-secondary-foreground">
      <span>{toolName}</span>
      {state === "output-error" && <span className="ml-2">There was an error using the tool</span>}
      {icon}
    </div>
  )
}
