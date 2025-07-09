"use client"

import { useRouter } from "next/navigation"

import { Settings, User } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

import { useAuth } from "@/contexts/auth-context"

import { PasswordDialog } from "./password-dialog"

export function ProfileHeader() {
  const { user } = useAuth()
  const router = useRouter()

  if (!user) {
    router.push("/signin")
    return null
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage
              src={user.photoURL || "/placeholder-user.jpg"}
              alt={user.displayName || "User"}
            />
            <AvatarFallback>
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">{user.displayName || "User"}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <PasswordDialog />
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div>
            <h3 className="mb-2 font-medium">Account Status</h3>
            <div className="flex items-center space-x-2">
              <div
                className={`h-2 w-2 rounded-full ${user.emailVerified ? "bg-green-500" : "bg-yellow-500"}`}
              />
              <span className="text-sm text-muted-foreground">
                {user.emailVerified ? "Email verified" : "Email not verified"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
