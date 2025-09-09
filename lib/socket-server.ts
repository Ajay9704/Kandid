import { Server as SocketIOServer } from 'socket.io'
import type { Server } from 'http'

// Store the Socket.IO server instance
let io: SocketIOServer | null = null

/**
 * Initialize Socket.IO server
 * @param httpServer The HTTP server instance
 */
export function initializeSocketIO(httpServer: Server) {
  if (!io) {
    io = new SocketIOServer(httpServer, {
      path: '/api/socket',
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    })

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id)

      socket.on('join-room', (room) => {
        socket.join(room)
        console.log(`Client ${socket.id} joined room: ${room}`)
      })

      socket.on('leave-room', (room) => {
        socket.leave(room)
        console.log(`Client ${socket.id} left room: ${room}`)
      })

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
      })
    })

    console.log('Socket.IO server initialized')
  }
  
  return io
}

/**
 * Get the Socket.IO server instance
 */
export function getSocketIO(): SocketIOServer | null {
  return io
}

/**
 * Emit an event to all connected clients
 * @param event The event name
 * @param data The data to send
 */
export function emitUpdateEvent(event: string, data?: any) {
  if (io) {
    io.emit(event, data)
    console.log(`Emitted event: ${event}`, data)
  } else {
    console.warn('Socket.IO server not initialized')
  }
}