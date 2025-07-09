"use client"

import { clearAge } from "@/shared/lib/actions"

import { Button } from "@/components/ui/button"

export default function AgeRestrictionPage() {
  const handleClearAge = async () => {
    await clearAge()
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl space-y-6 text-center">
        <h1 className="text-2xl font-medium text-foreground sm:text-3xl">
          This website is only intended for users over the age of 18.
        </h1>
        <p className="text-muted-foreground">
          You have been redirected here because you indicated you are under 18.
        </p>
        <Button onClick={handleClearAge} variant="outline" className="mt-4">
          Return to age verification
        </Button>
      </div>
    </div>
  )
}
