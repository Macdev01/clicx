"use client"

import { useState } from "react"

import { useRouter } from "next/navigation"

import { FirebaseError } from "firebase/app"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

import { useAuth } from "@/contexts/auth-context"

// Function to get user-friendly error message
const getErrorMessage = (error: FirebaseError): string => {
  switch (error.code) {
    case "auth/email-already-in-use":
      return "This email is already registered. Please sign in instead."
    case "auth/weak-password":
      return "Please choose a stronger password (at least 6 characters)."
    case "auth/invalid-email":
      return "Please enter a valid email address."
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection and try again."
    case "auth/operation-not-allowed":
      return "Email/password sign up is not enabled. Please contact support."
    case "auth/internal-error":
      return "An internal error occurred. Please try again later."
    default:
      // If we don't have a specific message, clean the Firebase message
      return cleanErrorMessage(error.message)
  }
}

// Helper function to clean error messages (fallback for unknown errors)
const cleanErrorMessage = (message: string): string => {
  const parts = message.split(" : ")
  if (parts.length > 1) {
    return parts[1]?.trim() || message.trim()
  }
  return message.trim()
}

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const { signUp } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])

    if (password !== confirmPassword) {
      setErrors(["Passwords do not match"])
      return
    }

    setIsLoading(true)

    try {
      await signUp(email, password)
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      })
      // Redirect to homepage
      router.push("/")
    } catch (error) {
      // Handle Firebase errors
      if (error instanceof FirebaseError) {
        const errorMessage = getErrorMessage(error)
        setErrors([errorMessage])
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
        })
      } else {
        // Fallback for non-Firebase errors
        setErrors(["An unexpected error occurred"])
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unexpected error occurred",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="mx-4 w-full max-w-md">
      <CardHeader className="space-y-2">
        <CardTitle className="text-center text-3xl font-bold">Create an account</CardTitle>
        <CardDescription className="text-center">
          Enter your email and password to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.length > 0 && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {errors.map((error, index) => (
                <p key={index}>{error}</p>
              ))}
            </div>
          )}
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Sign Up"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Button
              variant="link"
              className="h-auto p-0 font-normal"
              onClick={() => router.push("/signin")}
              disabled={isLoading}
            >
              Sign in
            </Button>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
