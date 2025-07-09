"use client"

import { Hero } from "@/components/content/hero"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <Hero />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
