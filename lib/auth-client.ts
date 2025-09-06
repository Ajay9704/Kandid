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

export type Session = ReturnType<typeof useSession>['data']