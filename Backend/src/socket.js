import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { createMessage } from './models/Message.js';

let ioInstance = null;

export function setupSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: 'http://localhost:5173' },
  });
  ioInstance = io;

  // Verify the token BEFORE allowing the connection — same idea as the
  // verifyToken middleware, just for sockets instead of regular HTTP requests.
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('No token provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    // Automatically join the user's personal room for direct notifications
    if (socket.user?.id) {
      socket.join(`user_${socket.user.id}`);
    }

    socket.on('join_project', (projectId) => {
      socket.join(`project_${projectId}`);
    });

    socket.on('send_message', async ({ projectId, body }) => {
      try {
        const message = await createMessage(projectId, socket.user.id, body);
        io.to(`project_${projectId}`).emit('new_message', {
          ...message,
          sender_name: socket.user.full_name,
        });
      } catch (error) {
        socket.emit('error_message', 'Could not send message');
      }
    });
  });

  return io;
}

export function sendNotificationToUser(userId, notification) {
  if (ioInstance && userId) {
    ioInstance.to(`user_${userId}`).emit('new_notification', notification);
  }
}
