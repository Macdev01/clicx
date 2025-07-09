import Link from "next/link"

import { Home, Layers, User } from "lucide-react"

import { BuildInfo } from "@/components/content/build-info"
import { Button } from "@/components/ui/button"

import { useAuth } from "@/contexts/auth-context"

export function Footer() {
  const { user } = useAuth()

  return (
    <footer className="sticky bottom-0 z-40 border-t bg-sky-50">
      <div className="container py-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex justify-center space-x-8">
            <Button
              variant="ghost"
              asChild
              className="text-gray-600 hover:bg-sky-100 hover:text-sky-500"
            >
              <Link href="/" className="flex items-center space-x-2">
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              asChild
              className="text-gray-600 hover:bg-sky-100 hover:text-sky-500"
            >
              <Link href="/models" className="flex items-center space-x-2">
                <Layers className="h-4 w-4" />
                <span>Models</span>
              </Link>
            </Button>
            {user ? (
              <Button
                variant="ghost"
                asChild
                className="text-gray-600 hover:bg-sky-100 hover:text-sky-500"
              >
                <Link href="/profile" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </Button>
            ) : (
              <Button variant="ghost" className="cursor-not-allowed text-gray-400" disabled>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Button>
            )}
          </div>
          <BuildInfo />
        </div>
      </div>
    </footer>
  )
}
