"use client"

import { useState } from "react"

import { useRouter } from "next/navigation"

import { auth } from "@/shared/config/firebase"
import { sendPasswordResetEmail } from "firebase/auth"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await sendPasswordResetEmail(auth, email)

      // Show success toast
      toast({
        title: "Success",
        description: "Password reset email sent! Redirecting to sign in...",
      })

      // Clear the email input
      setEmail("")

      // Redirect after a short delay (2 seconds)
      setTimeout(() => {
        router.push("/signin")
      }, 2000)
    } catch (error: any) {
      let errorMessage = "Failed to send reset email. Please try again."

      // Handle specific Firebase errors
      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "No account found with this email address."
          break
        case "auth/invalid-email":
          errorMessage = "Please enter a valid email address."
          break
        case "auth/too-many-requests":
          errorMessage = "Too many attempts. Please try again later."
          break
      }

      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="mx-4 w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
        <CardDescription>
          Enter your email address and we'll send you instructions to reset your password.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="w-full"
              autoComplete="email"
              autoFocus
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Reset Instructions"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => router.push("/signin")}
            disabled={isLoading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sign In
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
