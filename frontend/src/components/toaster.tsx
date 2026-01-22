"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

export function Toaster() {
  const { theme } = useTheme()

  return (
    <Sonner
      position="bottom-right"
      theme={theme as "light" | "dark" | "system"}
      toastOptions={{
        style: {
          background: "var(--background)",
          color: "var(--foreground)",
          border: "1px solid var(--border)"
        }
      }}
    />
  )
}
