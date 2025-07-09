"use client"

import { useRouter } from "next/navigation"

interface AgeRestrictionProps {
  onVerified: () => void
}

export function AgeRestriction({ onVerified }: AgeRestrictionProps) {
  const router = useRouter()

  const handleVerify = () => {
    onVerified()
    router.push("/")
  }

  const handleExit = () => {
    router.push("/age-restriction")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-8 bg-background p-4">
      {/* Main content container */}
      <div className="w-full max-w-2xl space-y-6 text-center">
        {/* Title text */}
        <h1 className="text-2xl font-medium text-foreground sm:text-3xl">
          This is an adult website
        </h1>
        <p className="text-lg text-muted-foreground">
          This website contains age-restricted materials including nudity and explicit depictions of
          sexual activity. By entering, you affirm that you are at least 18 years of age or the age
          of majority in the jurisdiction you are accessing the website from and you consent to
          viewing sexually explicit content.
        </p>
        <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
          <button
            onClick={handleVerify}
            className="rounded-md bg-sky-400 px-8 py-6 text-lg text-white hover:bg-sky-500"
          >
            I am 18 or older - Enter
          </button>
          <button
            onClick={handleExit}
            className="rounded-md border border-red-400 px-8 py-6 text-lg text-red-400 hover:bg-red-50"
          >
            I am under 18 - Exit
          </button>
        </div>
      </div>
    </div>
  )
}
