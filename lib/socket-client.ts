// Client-side socket utilities
import { io, Socket } from 'socket.io-client'

// Store the Socket.IO client instance
let socket: Socket | null = null

/**
 * Initialize Socket.IO client
 */
export function initializeSocketClient() {
  if (!socket) {
    // Initialize socket connection with current host
    const currentHost = window.location.origin
    socket = io(currentHost, {
      path: '/api/socket',
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
      timeout: 30000,
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: false,
      rejectUnauthorized: false,
      autoConnect: false, // We'll connect manually
      forceNew: true
    })

    socket.on('connect', () => {
      console.log('Socket connected with ID:', socket?.id)
    })

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
      if (reason === 'io server disconnect') {
        // The disconnection was initiated by the server, need to reconnect manually
        setTimeout(() => {
          if (socket) {
            socket.connect()
          }
        }, 1000)
      }
    })

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      // Try to reconnect after a delay
      setTimeout(() => {
        if (socket) {
          socket.connect()
        }
      }, 2000)
    })
    
    socket.on('error', (error) => {
      console.error('Socket error:', error)
    })
  }
  
  return socket
}

/**
 * Get the Socket.IO client instance
 */
export function getSocketClient(): Socket | null {
  return socket
}

/**
 * Emit an event to the server
 * @param event The event name
 * @param data The data to send
 */
export function emitUpdateEvent(event: string, data?: any) {
  if (socket && socket.connected) {
    socket.emit(event, data)
    console.log(`Emitted event: ${event}`, data)
  } else {
    console.warn('Socket not connected, could not emit event:', event)
  }
}

/**
 * Listen for events from the server
 * @param event The event name
 * @param callback The callback function
 */
export function onEvent(event: string, callback: (...args: any[]) => void) {
  if (socket) {
    socket.on(event, callback)
    return () => {
      socket?.off(event, callback)
    }
  }
  return () => {}
}