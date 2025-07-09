"use client"

import { createContext, useContext, useEffect, useState } from "react"

import { auth } from "@/shared/config/firebase"
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth"

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  sendVerificationEmail: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === "undefined" || !auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUser(user)
        setLoading(false)
      },
      (error) => {
        console.error("Auth state change error:", error)
        setError(error.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error("Auth is not initialized")

    try {
      setError(null)
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err) {
      const error = err as Error
      setError(error.message)
      throw error
    }
  }

  const signUp = async (email: string, password: string) => {
    if (!auth) throw new Error("Auth is not initialized")

    try {
      setError(null)
      await createUserWithEmailAndPassword(auth, email, password)
      // Send verification email immediately after successful signup
    } catch (err) {
      const error = err as Error
      setError(error.message)
      throw error
    }
  }

  const sendVerificationEmail = async () => {
    if (!auth.currentUser) throw new Error("No user is signed in")

    try {
      setError(null)
      await sendEmailVerification(auth.currentUser)
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
        signUp,
        logout,
        sendVerificationEmail,
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
