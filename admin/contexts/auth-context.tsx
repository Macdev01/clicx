"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { auth } from "@/shared/config/firebase"
import {
  User,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth"
import { useRouter, usePathname } from "next/navigation"

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === "undefined" || !auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        try {
          if (user) {
            // Get the ID token
            const token = await user.getIdToken()
            
            // Set the session cookie
            const response = await fetch(`/api/auth/session`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ token }),
              credentials: 'include', // Important for cookies
            })

            if (!response.ok) {
              console.error('Failed to set session cookie')
              setUser(null)
              setLoading(false)
              return
            }

            // Set user and redirect to home if we're on the signin page
            setUser(user)
            if (pathname === '/auth/signin') {
              router.push('/')
              router.refresh() // Force a refresh to update the UI
            }
          } else {
            // Clear the session cookie
            await fetch(`/api/auth/session`, {
              method: 'DELETE',
              credentials: 'include', // Important for cookies
            })
            setUser(null)
          }
          setLoading(false)
        } catch (error) {
          console.error("Auth state change error:", error)
          setUser(null)
          setLoading(false)
        }
      },
      (error) => {
        console.error("Auth state change error:", error)
        setError(error.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [router, pathname])

  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error("Auth is not initialized")

    try {
      setError(null)
      await signInWithEmailAndPassword(auth, email, password)
      // Force a router refresh after successful sign in
      router.refresh()
    } catch (err) {
      const error = err as Error
      setError(error.message)
      throw error
    }
  }

  const logout = async () => {
    if (!auth) throw new Error("Auth is not initialized")

    try {
      setError(null)
      await signOut(auth)
      router.push('/auth/signin')
      router.refresh() // Force a refresh after logout
    } catch (err) {
      const error = err as Error
      setError(error.message)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signIn,
        logout,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
} 