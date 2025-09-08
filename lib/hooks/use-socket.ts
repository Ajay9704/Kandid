"use client"

import { useEffect, useState } from 'react'

const SOCKET_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const SOCKET_PATH = '/api/socket'
const RECONNECT_ATTEMPTS = 1
const RECONNECT_DELAY = 10000
const PING_INTERVAL = 120000 // 2 minutes

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