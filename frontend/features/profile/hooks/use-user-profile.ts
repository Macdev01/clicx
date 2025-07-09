import { useEffect, useState } from "react"

import { useRouter } from "next/navigation"

import {
  EmailAuthProvider,
  getAuth,
  reauthenticateWithCredential,
  signOut,
  updatePassword,
  updateProfile,
} from "firebase/auth"

import { useToast } from "@/components/ui/use-toast"

import { useAuth } from "@/contexts/auth-context"

export function useUserProfile() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
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
      router.push("/")
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

  return {
    email,
    setEmail,
    username,
    setUsername,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    isSaving,
    passwordError,
    handleSaveChanges,
    handleLogout,
  }
}
