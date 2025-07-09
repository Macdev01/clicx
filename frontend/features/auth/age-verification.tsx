"use client"

import { useState } from "react"

import Link from "next/link"

import { verifyAge } from "@/shared/lib/actions"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function AgeVerification() {
  const [showRestriction, setShowRestriction] = useState(false)

  const handleVerify = async () => {
    try {
      await verifyAge()
    } catch (error) {
      console.error("Error verifying age:", error)
    }
  }

  const handleExit = () => {
    setShowRestriction(true)
  }

  if (showRestriction) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-4">
        <div className="w-full max-w-2xl space-y-6 text-center">
          <h1 className="text-2xl font-medium text-foreground sm:text-3xl">
            This website is only intended for users over the age of 18.
          </h1>
          <p className="text-muted-foreground">
            You have been redirected here because you indicated you are under 18.
          </p>
          <Button onClick={() => setShowRestriction(false)} variant="outline" className="mt-4">
            Return to age verification
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-4">
      <div className="w-full max-w-2xl">
        <Card className="border-none bg-transparent shadow-none">
          <CardHeader className="space-y-6 text-center">
            <CardTitle className="text-4xl font-bold text-foreground">
              This is an adult website
            </CardTitle>
            <CardDescription className="text-lg">
              This website contains age-restricted materials including nudity and explicit
              depictions of sexual activity. By entering, you affirm that you are at least 18 years
              of age or the age of majority in the jurisdiction you are accessing the website from
              and you consent to viewing sexually explicit content.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                onClick={handleVerify}
                className="bg-sky-400 py-6 text-lg text-white hover:bg-sky-500"
                size="lg"
              >
                I am 18 or older - Enter
              </Button>
              <Button
                variant="outline"
                className="border-red-400 py-6 text-lg text-red-400 hover:bg-red-50 hover:text-red-500"
                size="lg"
                onClick={handleExit}
              >
                I am under 18 - Exit
              </Button>
            </div>

            <div className="space-y-4 pt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Our Terms are changing. These changes will come into effect on{" "}
                <span className="font-semibold">30 June 2025</span>. To see the updated changes,
                please see our{" "}
                <Link href="/terms" className="text-sky-400 hover:text-sky-500">
                  Terms of Service
                </Link>
                .
              </p>

              <p className="text-sm text-muted-foreground">
                Our{" "}
                <Link href="/parental-controls" className="text-sky-400 hover:text-sky-500">
                  parental controls page
                </Link>{" "}
                explains how you can easily block access to this site.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
