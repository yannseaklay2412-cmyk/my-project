import express from 'express';
import { getResources, createResource, voteResource } from '../controllers/Resource.js';
import { verifyToken, optionalToken } from '../middleware/verifyToken.js';

const router = express.Router();

router.get('/', optionalToken, getResources);
router.post('/', verifyToken, createResource);
router.post('/:id/vote', verifyToken, voteResource);

export default router;
