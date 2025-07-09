"use client"

import { Suspense } from "react"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

import { Toaster } from "@/components/ui/toaster"

import { AuthProvider } from "@/contexts/auth-context"
import { SearchProvider } from "@/contexts/search-context"

interface ClientLayoutProps {
  children: React.ReactNode
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
})

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SearchProvider>
          <Suspense fallback={<div>Loading...</div>}>
            {children}
            <Toaster />
          </Suspense>
        </SearchProvider>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
