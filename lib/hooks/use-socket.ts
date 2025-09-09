"use client"

import { useEffect, useState, useRef, useCallback } from 'react'
import { initializeSocketClient, getSocketClient, onEvent, emitUpdateEvent } from '@/lib/socket-client'

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [manuallyDisconnected, setManuallyDisconnected] = useState(false)
  const socketRef = useRef(getSocketClient())

  const connect = useCallback(() => {
    if (!socketRef.current) {
      socketRef.current = initializeSocketClient()
    }

    if (socketRef.current?.connected) {
      setIsConnected(true)
      return
    }

    if (socketRef.current) {
      // Remove existing listeners to prevent duplicates
      socketRef.current.off('connect')
      socketRef.current.off('disconnect')
      socketRef.current.off('connect_error')

      socketRef.current.on('connect', () => {
        console.log('Socket connected')
        setIsConnected(true)
      })

      socketRef.current.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason)
        setIsConnected(false)
      })

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
        setIsConnected(false)
      })

      // Listen for data updates
      socketRef.current.on('campaigns_updated', () => {
        console.log('Campaigns updated event received')
      })

      socketRef.current.on('leads_updated', () => {
        console.log('Leads updated event received')
      })

      // Only connect if not manually disconnected
      if (!manuallyDisconnected) {
        // Add a small delay to ensure the server is ready
        setTimeout(() => {
          if (socketRef.current && !manuallyDisconnected && !socketRef.current.connected) {
            console.log('Attempting to connect socket...')
            socketRef.current.connect()
          }
        }, 100)
      }
    }
  }, [manuallyDisconnected])

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      setIsConnected(false)
    }
  }, [])

  const toggleConnection = useCallback(() => {
    if (isConnected) {
      disconnect()
      setManuallyDisconnected(true)
    } else {
      setManuallyDisconnected(false)
      connect()
    }
  }, [isConnected, connect, disconnect])

  const emit = useCallback((event: string, data?: any) => {
    emitUpdateEvent(event, data)
  }, [])

  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    return onEvent(event, callback)
  }, [])

  useEffect(() => {
    // Initial connection attempt
    connect()

    // Periodic reconnection attempt if not connected
    const reconnectInterval = setInterval(() => {
      if (!isConnected && !manuallyDisconnected && socketRef.current) {
        if (!socketRef.current.connected) {
          console.log('Attempting periodic reconnection...')
          connect()
        }
      }
    }, 10000) // Try to reconnect every 10 seconds

    // Cleanup function
    return () => {
      clearInterval(reconnectInterval)
      // Don't disconnect the socket when component unmounts
      // as it might be used by other components
    }
  }, [connect, isConnected, manuallyDisconnected])

  return { 
    socket: socketRef.current, 
    isConnected: !manuallyDisconnected && isConnected,
    toggleConnection,
    manuallyDisconnected,
    emit,
    on
  }
}