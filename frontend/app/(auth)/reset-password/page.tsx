"use client"

import { useEffect, useState } from "react"

import { useRouter, useSearchParams } from "next/navigation"

import { auth } from "@/shared/config/firebase"
import { confirmPasswordReset } from "firebase/auth"

import { Alert, AlertDescription } from "@/components/ui/alert"
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

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<{
    type: "success" | "error" | null
    message: string
  }>({ type: null, message: "" })

  // Get oobCode from URL (Firebase's reset code)
  const oobCode = searchParams.get("oobCode")

  useEffect(() => {
    if (!oobCode) {
      router.push("/signin")
    }
  }, [oobCode, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      setStatus({
        type: "error",
        message: "Passwords do not match.",
      })
      return
    }

    if (newPassword.length < 6) {
      setStatus({
        type: "error",
        message: "Password must be at least 6 characters long.",
      })
      return
    }

    setIsLoading(true)
    setStatus({ type: null, message: "" })

    try {
      await confirmPasswordReset(auth, oobCode!, newPassword)
      setStatus({
        type: "success",
        message: "Password reset successful! You can now sign in with your new password.",
      })

      // Redirect to sign in after 3 seconds
      setTimeout(() => {
        router.push("/signin")
      }, 3000)
    } catch (error: any) {
      let errorMessage = "Failed to reset password. Please try again."

      switch (error.code) {
        case "auth/expired-action-code":
          errorMessage = "Reset link has expired. Please request a new one."
          break
        case "auth/invalid-action-code":
          errorMessage = "Invalid reset link. Please request a new one."
          break
        case "auth/weak-password":
          errorMessage = "Please choose a stronger password."
          break
      }

      setStatus({
        type: "error",
        message: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!oobCode) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container max-w-md py-8">
      <Card>
        <CardHeader>
          <CardTitle>Set New Password</CardTitle>
          <CardDescription>Please enter your new password below.</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {status.type && (
              <Alert variant={status.type === "success" ? "default" : "destructive"}>
                <AlertDescription>{status.message}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </CardContent>

          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
