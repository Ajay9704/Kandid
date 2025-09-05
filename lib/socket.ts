import { Server as NetServer } from 'http'
import { NextApiRequest, NextApiResponse } from 'next'
import { Server as ServerIO } from 'socket.io'

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: ServerIO
    }
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}

const SocketHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (res.socket.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const io = new ServerIO(res.socket.server)
    res.socket.server.io = io

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
  }
  res.end()
}

export default SocketHandler