"use client"

import type React from "react"

import Image from "next/image"
import Link from "next/link"

import { Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { useAuth } from "@/contexts/auth-context"
import { useSearch } from "@/contexts/search-context"

export function Header() {
  const { searchTerm, setSearchTerm } = useSearch()
  const { user } = useAuth()

  const handleClearSearch = () => {
    setSearchTerm("")
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/90">
      <div className="container flex h-16 items-center justify-between px-[1%]">
        {/* Left Logo */}
        <div className="flex-1">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.jpg"
              alt="Clixxx.me Logo"
              width={100}
              height={40}
              priority
              className="h-11 w-auto"
            />
          </Link>
        </div>

        {/* Centered Search Bar */}
        <div className="flex max-w-sm flex-1 justify-center">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500" />
            <Input
              placeholder="Search by author, nickname, or tags..."
              className="w-full border-gray-200 pl-10 pr-10 focus:border-sky-400 focus:ring-sky-400"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 transition-colors hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Auth Buttons or MyContent */}
        <div className="flex flex-1 justify-end space-x-4">
          {user ? (
            <Button asChild className="bg-sky-400 text-white hover:bg-sky-500">
              <Link href="/mycontent">MyContent</Link>
            </Button>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                className="text-gray-600 hover:bg-sky-100 hover:text-sky-500"
              >
                <Link href="/signin">Sign in</Link>
              </Button>
              <Button asChild className="bg-sky-400 text-white hover:bg-sky-500">
                <Link href="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
