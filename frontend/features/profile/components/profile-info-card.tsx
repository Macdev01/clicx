import { useEffect, useState } from "react"

import {
  EmailAuthProvider,
  getAuth,
  reauthenticateWithCredential,
  signOut,
  updatePassword,
  updateProfile,
} from "firebase/auth"
import { CreditCard, Edit, LogOut, Star } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

import { useAuth } from "@/contexts/auth-context"

export function ProfileInfoCard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [email, setEmail] = useState(user?.email || "")
  const [username, setUsername] = useState(user?.displayName || "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [passwordError, setPasswordError] = useState("")

  // Update state when user data changes
  useEffect(() => {
    if (user) {
      setEmail(user.email || "")
      setUsername(user.displayName || "")
    }
  }, [user])

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return "Password must be at least 6 characters long"
    }
    return ""
  }

  const updateUserProfile = async () => {
    if (!user) throw new Error("No user found")

    // Reset password error
    setPasswordError("")

    // Handle password update if new password is provided
    if (newPassword) {
      // Validate new password
      const passwordValidationError = validatePassword(newPassword)
      if (passwordValidationError) {
        setPasswordError(passwordValidationError)
        throw new Error(passwordValidationError)
      }

      if (!currentPassword) {
        setPasswordError("Current password is required to update password")
        throw new Error("Current password is required")
      }

      try {
        // First reauthenticate
        const credential = EmailAuthProvider.credential(user.email!, currentPassword)
        await reauthenticateWithCredential(user, credential)

        // Then update password
        await updatePassword(user, newPassword)

        // Clear password fields
        setCurrentPassword("")
        setNewPassword("")

        toast({
          title: "Success",
          description: "Password updated successfully",
          variant: "default",
        })
      } catch (error: any) {
        console.error("Error updating password:", error)
        if (error.code === "auth/wrong-password") {
          setPasswordError("Current password is incorrect")
        } else {
          setPasswordError("Failed to update password. Please try again.")
        }
        throw error
      }
    }

    if (username !== user.displayName) {
      await updateProfile(user, { displayName: username })
    }
  }

  const handleSaveChanges = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      await updateUserProfile()

      toast({
        title: "Success",
        description: "Profile updated successfully",
        variant: "default",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      const auth = getAuth()
      await signOut(auth)
      toast({
        title: "Success",
        description: "You have been logged out successfully",
        variant: "default",
      })
    } catch (error) {
      console.error("Error logging out:", error)
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your personal information and preferences</CardDescription>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <Button className="bg-sky-400 text-white hover:bg-sky-500">
            <CreditCard className="mr-2 h-4 w-4" />
            Top Up Balance
          </Button>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Current Balance</p>
            <p className="text-lg font-semibold text-green-600">$247.50</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Profile" />
            <AvatarFallback className="text-lg">JD</AvatarFallback>
          </Avatar>
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Change Avatar
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} disabled className="bg-gray-50" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value)
            }}
            placeholder="Set your username"
          />
        </div>

        <div className="space-y-4 border-t pt-4">
          <h3 className="font-medium">Change Password</h3>

          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter your new password"
            />
            {passwordError && <p className="mt-1 text-sm text-red-500">{passwordError}</p>}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <Button onClick={handleSaveChanges} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              variant="outline"
              className="border-yellow-400 text-yellow-600 hover:bg-yellow-50"
            >
              <Star className="mr-2 h-4 w-4" />
              Become a Model
            </Button>
          </div>
          <Button
            variant="outline"
            className="border-red-400 text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
