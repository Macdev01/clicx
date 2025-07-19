'use client'

import { useAuth } from '@/contexts/auth-context'
import Header from '@/components/layout/header'
import Navigation from '@/components/layout/navigation'

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100">
        {children}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex">
        <Navigation />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
} 