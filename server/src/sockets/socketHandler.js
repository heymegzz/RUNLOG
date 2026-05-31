// Socket.io event setup
// Implement in Phase 4

import { Server } from 'socket.io';

let io;

export const initSocketIO = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    socket.on('join:workspace', (workspaceId) => {
      socket.join(`workspace:${workspaceId}`);
      console.log(`📡 Socket ${socket.id} joined workspace:${workspaceId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};
