"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSocketIO = initializeSocketIO;
exports.getSocketIO = getSocketIO;
exports.emitUpdateEvent = emitUpdateEvent;
const socket_io_1 = require("socket.io");

// Store the Socket.IO server instance
let io = null;

/**
 * Initialize Socket.IO server
 * @param httpServer The HTTP server instance
 */
function initializeSocketIO(httpServer) {
    console.log('Socket.IO initialization started');
    if (!io) {
        console.log('Creating new Socket.IO server instance');
        io = new socket_io_1.Server({
            cors: {
                origin: ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001"],
                methods: ["GET", "POST"],
                credentials: true,
                allowedHeaders: ["Content-Type"]
            },
            allowEIO3: true,
            transports: ['websocket', 'polling'],
            path: '/api/socket'
        });

        console.log('Attaching Socket.IO to HTTP server');
        // Attach to the HTTP server
        io.attach(httpServer);

        io.on('connection', function (socket) {
            console.log('Client connected:', socket.id);
            
            socket.on('join-room', function (room) {
                socket.join(room);
                console.log("Client ".concat(socket.id, " joined room: ").concat(room));
            });

            socket.on('leave-room', function (room) {
                socket.leave(room);
                console.log("Client ".concat(socket.id, " left room: ").concat(room));
            });

            socket.on('disconnect', function (reason) {
                console.log('Client disconnected:', socket.id, 'Reason:', reason);
            });

            // Handle connection errors
            socket.on('error', function (error) {
                console.error('Socket error for client', socket.id, error);
            });
        });

        // Handle server-level errors
        io.engine.on('connection_error', function (error) {
            console.error('Socket.IO connection error:', error);
        });

        console.log('Socket.IO server initialized and attached to HTTP server');
    } else {
        console.log('Socket.IO server already initialized');
    }
    return io;
}

/**
 * Get the Socket.IO server instance
 */
function getSocketIO() {
    return io;
}

/**
 * Emit an event to all connected clients
 * @param event The event name
 * @param data The data to send
 */
function emitUpdateEvent(event, data) {
    if (io) {
        io.emit(event, data);
        console.log("Emitted event: ".concat(event), data);
    } else {
        console.warn('Socket.IO server not initialized');
    }
}