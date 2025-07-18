import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/auth-context'
import ProtectedLayout from '@/components/layout/protected-layout'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Admin Panel',
  description: 'Admin panel for managing users, models, videos, and posts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ProtectedLayout>
            {children}
          </ProtectedLayout>
        </AuthProvider>
      </body>
    </html>
  )
}
