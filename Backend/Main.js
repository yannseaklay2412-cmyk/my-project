import express from 'express';
import cors from 'cors';
import pool from './src/config/db.js';
import authRoutes from './src/routes/Auth.js';
import projectRoutes from './src/routes/Project.js';
import resourceRoutes from './src/routes/Resource.js';

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use('/api', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/resources', resourceRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));
