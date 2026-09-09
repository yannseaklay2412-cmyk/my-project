import express from 'express';
import {
  getProjects,
  getProject,
  createProject,
  patchProject,
  getComments,
  addComment,
  getSavedProjects,
  toggleSaveProject,
  removeSavedProject,
} from '../controllers/Project.js';
import { getTasks, addTask, patchTask, removeTask, getMembers } from '../controllers/Task.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

// Saved projects (must be defined before /:id to prevent matching 'saved' as an id param)
router.get('/saved', verifyToken, getSavedProjects);
router.post('/:id/save', verifyToken, toggleSaveProject);
router.delete('/:id/save', verifyToken, removeSavedProject);

router.get('/', getProjects);
router.get('/:id', getProject);
router.post('/', verifyToken, createProject);
router.patch('/:id', verifyToken, patchProject);

router.get('/:id/comments', getComments);
router.post('/:id/comments', verifyToken, addComment);

// Tasks & Members
router.get('/:id/tasks', getTasks);
router.post('/:id/tasks', verifyToken, addTask);
router.patch('/:id/tasks/:taskId', verifyToken, patchTask);
router.delete('/:id/tasks/:taskId', verifyToken, removeTask);
router.get('/:id/members', getMembers);

export default router;
