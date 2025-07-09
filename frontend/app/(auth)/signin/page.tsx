"use client"

import { useState } from "react"

import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

import { useAuth } from "@/contexts/auth-context"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await signIn(email, password)
      toast({ title: "Success!", description: "You have been signed in." })
      router.push("/")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to sign in",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="mx-4 w-full max-w-md">
      <CardHeader className="space-y-2">
        <CardTitle className="text-center text-3xl font-bold">Welcome back</CardTitle>
        <CardDescription className="text-center">
          Enter your email and password to sign in to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
          <div className="space-y-2 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Button
                variant="link"
                className="h-auto p-0 font-normal"
                onClick={() => router.push("/signup")}
                disabled={isLoading}
              >
                Sign up
              </Button>
            </p>
            <p className="text-sm text-muted-foreground">
              <Button
                type="button"
                variant="link"
                className="h-auto p-0 text-sm font-normal"
                onClick={() => router.push("/forgot-password")}
                disabled={isLoading}
              >
                Forgot your password?
              </Button>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
