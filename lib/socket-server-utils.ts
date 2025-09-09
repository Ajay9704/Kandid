// Server-side socket utilities
import { getSocketIO, emitUpdateEvent } from './socket-server'

/**
 * Emit an event to all connected clients
 * @param event The event name
 * @param data The data to send
 */
export function emitServerUpdateEvent(event: string, data?: any) {
  emitUpdateEvent(event, data)
}

/**
 * Get the Socket.IO server instance
 */
export function getServerSocketIO() {
  return getSocketIO()
}