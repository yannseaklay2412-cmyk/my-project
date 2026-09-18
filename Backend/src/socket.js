import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { createMessage } from './models/Message.js';
import { getProjectById } from './models/Project.js';
import { getProjectMembers } from './models/Projectmember.js';
import { getRequestByProjectAndUser } from './models/CollaborationRequest.js';

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
      const secret = process.env.JWT_SECRET || 'c8f1a27e94b30d65e712a83f95b0c41872e4d96a5b3c1082f76e4d29a15b8390';
      const decoded = jwt.verify(token, secret);
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

    socket.on('join_project', async (projectId) => {
      try {
        const project = await getProjectById(projectId);
        if (!project) {
          socket.join(`project_${projectId}`);
          return;
        }
        const isOwner = String(project.owner_id) === String(socket.user.id);
        const members = await getProjectMembers(projectId);
        const req = await getRequestByProjectAndUser(projectId, socket.user.id);
        const isAccepted = req?.status === 'accepted';
        const isMember = isOwner || isAccepted || members.some((m) => String(m.user_id) === String(socket.user.id));
        if (isMember) {
          socket.join(`project_${projectId}`);
        } else {
          socket.emit('error_message', 'Only team members can join the project chat');
        }
      } catch (err) {
        socket.join(`project_${projectId}`);
      }
    });

    socket.on('send_message', async ({ projectId, body }) => {
      try {
        const project = await getProjectById(projectId);
        if (project) {
          const isOwner = String(project.owner_id) === String(socket.user.id);
          const members = await getProjectMembers(projectId);
          const req = await getRequestByProjectAndUser(projectId, socket.user.id);
          const isAccepted = req?.status === 'accepted';
          const isMember = isOwner || isAccepted || members.some((m) => String(m.user_id) === String(socket.user.id));
          if (!isMember) {
            socket.emit('error_message', 'Only team members can send messages in this chat');
            return;
          }
        }

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
