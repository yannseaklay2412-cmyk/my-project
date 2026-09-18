import express from 'express';
import { validateSignup } from '../middleware/Validatesignup.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { getAllUsers, createAccount, login, getMe, updateProfile, getUserProfile } from '../controllers/Auth.js';

const router = express.Router();

router.post('/Createuser', authLimiter, validateSignup, createAccount);
router.post('/login', authLimiter, login);
router.get('/getAllusers', getAllUsers);
router.get('/users/:id', getUserProfile);
router.get('/me', verifyToken, getMe);
router.patch('/profile', verifyToken, updateProfile);

export default router;
