"use client"

import { createContext, useContext, ReactNode } from 'react'
import { useSocket } from '@/lib/hooks/use-socket'

interface SocketContextType {
  isConnected: boolean
  toggleConnection: () => void
  manuallyDisconnected: boolean
  emit: (event: string, data?: any) => void
  on: (event: string, callback: (...args: any[]) => void) => () => void
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export function SocketProvider({ children }: { children: ReactNode }) {
  const socketData = useSocket()
  
  return (
    <SocketContext.Provider value={socketData}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocketContext() {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error('useSocketContext must be used within a SocketProvider')
  }
  return context
}