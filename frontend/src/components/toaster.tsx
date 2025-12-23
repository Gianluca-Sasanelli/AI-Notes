"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

export function Toaster() {
  const { theme } = useTheme()

  return <Sonner position="bottom-right" richColors theme={theme as "light" | "dark" | "system"} />
}
