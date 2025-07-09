"use client"

import { useEffect } from "react"

import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="container px-[1%] py-8 text-center">
      <h2 className="mb-4 text-2xl font-bold">Something went wrong!</h2>
      <p className="mb-6 text-gray-600">{error.message}</p>
      <Button onClick={() => reset()} variant="default">
        Try again
      </Button>
    </div>
  )
}
