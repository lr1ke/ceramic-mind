"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface AuthContextType {
  isAuthenticated: boolean
  isVerifying: boolean
  userProof: string | null
  login: () => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [userProof, setUserProof] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is already authenticated
    const savedAuth = localStorage.getItem("rarimo-auth")
    const savedProof = localStorage.getItem("rarimo-proof")
    if (savedAuth === "true" && savedProof) {
      setIsAuthenticated(true)
      setUserProof(savedProof)
    }
  }, [])

  const login = async () => {
    setIsVerifying(true)
    try {
      // Initialize Rarimo SDK
      const { createRarimoAuth } = await import("@/lib/rarimo")
      const auth = await createRarimoAuth()

      // Request human verification
      const proof = await auth.createZKProof({
        credentialType: "humanity",
        challenge: `diary-app-${Date.now()}`,
      })

      if (proof) {
        setUserProof(proof)
        setIsAuthenticated(true)
        localStorage.setItem("rarimo-auth", "true")
        localStorage.setItem("rarimo-proof", proof)
      }
    } catch (error) {
      console.error("Authentication failed:", error)
      throw error
    } finally {
      setIsVerifying(false)
    }
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUserProof(null)
    localStorage.removeItem("rarimo-auth")
    localStorage.removeItem("rarimo-proof")
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isVerifying, userProof, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
