import { toast } from "sonner"

const NETWORK_ERROR_PATTERNS = ["failed to fetch", "network error", "networkerror", "load failed"]

export function isNetworkError(error: Error): boolean {
  const msg = error.message?.toLowerCase() ?? ""
  return NETWORK_ERROR_PATTERNS.some((p) => msg.includes(p))
}

function isTabHidden(): boolean {
  return typeof document !== "undefined" && document.visibilityState === "hidden"
}

export function handleChatError(error: Error): void {
  const networkError = isNetworkError(error)

  if (networkError && isTabHidden()) return

  let message = networkError
    ? "Connection lost. Please check your network."
    : error.message?.trim() || "An error has occurred. Please try again."

  if (message.length > 400) {
    message = "An error has occurred. Please try again."
  }

  toast.error(message)
}
