"use client"

import { useSession } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Sidebar } from '@/components/sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, isLoading } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !session) {
      router.push('/auth/signin')
    }
  }, [session, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="min-h-full">
          {children}
        </div>
      </main>
    </div>
  )
}