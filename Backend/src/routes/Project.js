import express from 'express';
import { getProjects, createProject } from '../controllers/Project.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

router.get('/', getProjects);
router.post('/', verifyToken, createProject);

export default router;
