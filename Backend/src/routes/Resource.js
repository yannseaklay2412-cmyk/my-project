import express from 'express';
import { getResources, createResource } from '../controllers/Resource.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

router.get('/', getResources);
router.post('/', verifyToken, createResource);

export default router;
