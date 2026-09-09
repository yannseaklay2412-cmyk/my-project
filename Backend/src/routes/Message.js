import express from 'express';
import { getMessages } from '../controllers/Message.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router({ mergeParams: true });

router.get('/', verifyToken, getMessages);

export default router;
