"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-client'

export default function HomePage() {
  const { data: session, isLoading } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (session) {
        router.push('/dashboard')
      } else {
        router.push('/auth/signin')
      }
    }
  }, [session, isLoading, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>
  )
}