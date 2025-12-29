"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import { Sidebar } from "@/components/sidebar"

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
            retry: 1
          }
        }
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 overflow-hidden min-h-screen">{children}</div>
      </div>
    </QueryClientProvider>
  )
}
