const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

console.log('Starting server initialization...')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  console.log('Next.js app prepared')
  
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  })

  console.log('HTTP server created')

  // Initialize Socket.IO with proper configuration
  console.log('Initializing Socket.IO server...')
  const io = new Server(server, {
    path: '/api/socket',
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true
    },
    allowEIO3: true,
    transports: ['websocket', 'polling'],
    upgrade: false,
    connectTimeout: 30000,
    pingTimeout: 10000,
    pingInterval: 25000
  })

  console.log('Socket.IO server instance created')

  // Socket.IO connection handling
  io.on('connection', (socket) => {
    console.log('Socket.IO client connected:', socket.id)
    
    socket.on('join-room', (room) => {
      socket.join(room)
      console.log(`Client ${socket.id} joined room: ${room}`)
    })

    socket.on('leave-room', (room) => {
      socket.leave(room)
      console.log(`Client ${socket.id} left room: ${room}`)
    })

    socket.on('disconnect', (reason) => {
      console.log(`Client ${socket.id} disconnected. Reason:`, reason)
    })

    socket.on('error', (error) => {
      console.error(`Socket error for client ${socket.id}:`, error)
    })
  })

  // Handle connection errors
  io.engine.on('connection_error', (error) => {
    console.error('Socket.IO connection error:', error)
  })

  console.log('Setting up server listener...')
  server.listen(port, hostname, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
    console.log(`> Socket.IO server running on http://${hostname}:${port}/api/socket`)
  })
})