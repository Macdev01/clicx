import { Inter } from "next/font/google"

import { AgeVerification } from "@/features/auth"
import { getAgeVerified } from "@/shared/lib/cookies"

import ClientLayout from "@/components/layout/client-layout"

import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Clixxx.me",
  description: "Adult content platform",
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const isAgeVerified = await getAgeVerified()

  return (
    <html lang="en">
      <body className={inter.className}>
        {!isAgeVerified ? <AgeVerification /> : <ClientLayout>{children}</ClientLayout>}
      </body>
    </html>
  )
}
