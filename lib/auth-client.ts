"use client"

import { signIn, signOut, useSession } from "next-auth/react"
import { useState, useEffect } from "react"

export function useAuth() {
  const { data: session, status } = useSession()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    if (status === "loading") {
      setIsLoading(true)
      return
    }

    if (session?.user) {
      setIsAuthenticated(true)
      setUser(session.user)
    } else {
      setIsAuthenticated(false)
      setUser(null)
    }
    
    setIsLoading(false)
  }, [session, status])

  const loginWithCredentials = async (email: string, password: string) => {
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })
      return result
    } catch (error) {
      console.error("Login error:", error)
      return { 
        error: "An error occurred during login",
        status: 500,
        ok: false,
        url: null
      }
    }
  }

  const loginWithGoogle = async () => {
    try {
      const result = await signIn("google", {
        callbackUrl: "/dashboard",
        redirect: true,
      })
      return result
    } catch (error) {
      console.error("Google login error:", error)
      // For Google login, we don't return a structured response since it redirects
      return { 
        error: "An error occurred during Google login",
        status: 500,
        ok: false,
        url: null
      }
    }
  }

  const logout = async () => {
    try {
      await signOut({ redirect: true, callbackUrl: "/auth/signin" })
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return {
    isAuthenticated,
    isLoading,
    user,
    loginWithCredentials,
    loginWithGoogle,
    logout,
  }
}

// Client-side signup function
export async function signUp({ name, email, password }: { name: string; email: string; password: string }) {
  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        error: {
          message: result.error || 'Failed to create account',
        },
        data: null,
      }
    }

    return {
      error: null,
      data: result,
    }
  } catch (error) {
    console.error('Signup error:', error)
    return {
      error: {
        message: 'An error occurred. Please try again.',
      },
      data: null,
    }
  }
}

// Export the hooks and functions directly for easier import
export { useSession, signOut }
export default useAuth