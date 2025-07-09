"use client"

import { Footer } from "@/components/layout/footer"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-sky-50 to-white">
      <main className="flex flex-1 items-center justify-center">{children}</main>
      <Footer />
    </div>
  )
}
