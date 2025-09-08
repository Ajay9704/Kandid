"use client"

import { useSession as useNextAuthSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "next-auth/react"

export const useSession = () => {
  const { data: session, status } = useNextAuthSession()
  
  return {
    data: session,
    isPending: status === "loading",
    isAuthenticated: !!session,
  }
}

export const signIn = nextAuthSignIn
export const signOut = nextAuthSignOut

// Sign up function to match the expected API in the signup page
export const signUp = {
  email: async ({ name, email, password }: { name: string; email: string; password: string }) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          error: {
            message: data.error || 'Failed to create account',
          },
          data: null,
        }
      }

      // Successfully created account, now sign them in
      const signInResult = await nextAuthSignIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (signInResult?.error) {
        return {
          error: {
            message: 'Account created but sign in failed. Please try signing in manually.',
          },
          data: null,
        }
      }

      return {
        data: {
          user: data.user,
        },
        error: null,
      }
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'An error occurred during signup',
        },
        data: null,
      }
    }
  },
}

export type Session = ReturnType<typeof useSession>['data']