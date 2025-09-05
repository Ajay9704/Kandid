"use client"

import { useEffect, useState } from 'react'

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(true)
  const [manuallyDisconnected, setManuallyDisconnected] = useState(false)

  useEffect(() => {
    if (!manuallyDisconnected) {
      // Simulate connection status - in a real app this would connect to a socket server
      setIsConnected(true)
      
      // Simulate occasional disconnections for demo purposes
      const interval = setInterval(() => {
        setIsConnected(prev => {
          // 98% chance to stay connected
          return Math.random() > 0.02 ? true : prev
        })
      }, 10000)

      return () => clearInterval(interval)
    } else {
      setIsConnected(false)
    }
  }, [manuallyDisconnected])

  const toggleConnection = () => {
    setManuallyDisconnected(!manuallyDisconnected)
  }

  return { 
    socket: null, 
    isConnected: !manuallyDisconnected && isConnected,
    toggleConnection,
    manuallyDisconnected
  }
}