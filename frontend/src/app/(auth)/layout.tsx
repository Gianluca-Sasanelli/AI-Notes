"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { GTProvider } from "gt-react"
import gtConfig from "../../../gt.config.json"
import loadTranslations from "@/lib/utils"
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            retry: 2
          }
        }
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <GTProvider config={gtConfig} loadTranslations={loadTranslations}>
        <div className="flex h-svh">
          <Sidebar />
          <div className="flex-1 overflow-y-auto bg-background h-svh">{children}</div>
        </div>
      </GTProvider>
    </QueryClientProvider>
  )
}
