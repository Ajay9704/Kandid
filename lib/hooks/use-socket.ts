"use client"

import { useEffect, useState } from 'react'

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Simulate connection status - in a real app this would connect to a socket server
    setIsConnected(true)
    
    // Simulate occasional disconnections for demo purposes
    const interval = setInterval(() => {
      setIsConnected(prev => {
        // 95% chance to stay connected
        return Math.random() > 0.05 ? true : prev
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return { socket: null, isConnected }
}