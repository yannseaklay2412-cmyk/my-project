import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import pool from './src/config/db.js';
import authRoutes from './src/routes/Auth.js';
import projectRoutes from './src/routes/Project.js';
import resourceRoutes from './src/routes/Resource.js';
import messageRoutes from './src/routes/Message.js';
import collaborationRoutes from './src/routes/CollaborationRequest.js';
import notificationRoutes from './src/routes/Notification.js';
import { setupSocket } from './src/socket.js';

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use('/api', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/projects/:projectId/messages', messageRoutes);
app.use('/api/projects/:projectId/requests', collaborationRoutes);
app.use('/api/notifications', notificationRoutes);

const httpServer = createServer(app);
setupSocket(httpServer);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));
