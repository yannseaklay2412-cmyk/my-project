import express from 'express';
import { getResources } from '../controllers/Resource.js';

const router = express.Router();

router.get('/', getResources);

export default router;
