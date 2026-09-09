import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import {
  submitRequest,
  getMyRequest,
  getProjectRequests,
  respondToRequest,
} from '../controllers/CollaborationRequest.js';

const router = express.Router({ mergeParams: true });

router.post('/', verifyToken, submitRequest);
router.get('/', verifyToken, getProjectRequests);
router.get('/my-status', verifyToken, getMyRequest);
router.patch('/:requestId', verifyToken, respondToRequest);
router.patch('/:requestId/status', verifyToken, respondToRequest);

export default router;

