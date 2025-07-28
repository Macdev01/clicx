'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../config/firebase'

interface User {
  uid: string
  email: string
  displayName?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function isMockFirebase() {
  // If any Firebase config is a mock value, treat as mock
  return (
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'mock-api-key' ||
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN === 'mock.firebaseapp.com' ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === 'mock-project-id'
  )
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isMockFirebase()) {
      // Always "logged in" as admin for local/dev
      setUser({
        uid: 'mock-admin-uid',
        email: 'admin@local.dev',
        displayName: 'Admin (Mock)'
      })
      setLoading(false)
      return
    }
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || undefined
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const handleSignOut = async () => {
    if (isMockFirebase()) {
      setUser({
        uid: 'mock-admin-uid',
        email: 'admin@local.dev',
        displayName: 'Admin (Mock)'
      })
      return
    }
    try {
      await signOut(auth)
      setUser(null)
      window.location.reload()
    } catch (error) {
      setUser(null)
      window.location.reload()
    }
  }

  const value = {
    user,
    loading,
    signOut: handleSignOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 