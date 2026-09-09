import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import {
  getNotifications,
  markRead,
  markAllRead,
} from '../controllers/Notification.js';

const router = express.Router();

router.get('/', verifyToken, getNotifications);
router.patch('/read-all', verifyToken, markAllRead);
router.patch('/:id/read', verifyToken, markRead);

export default router;
