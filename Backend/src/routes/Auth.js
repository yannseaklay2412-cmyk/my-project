import express from 'express';
import { validateSignup } from '../middleware/Validatesignup.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { getAllUsers, createAccount, login, getMe, updateProfile } from '../controllers/Auth.js';

const router = express.Router();

router.post('/Createuser', validateSignup, createAccount);
router.get('/getAllusers', getAllUsers);
router.post('/login', login);
router.get('/me', verifyToken, getMe);
router.patch('/profile', verifyToken, updateProfile);

export default router;
