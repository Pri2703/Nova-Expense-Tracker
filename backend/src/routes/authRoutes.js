import express from 'express';
import {
  registerUser,
  loginUser,
  refresh,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  seedDemoData,
  wipeAccountData,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh', refresh);
router.post('/logout', logoutUser);

router.get('/me', protect, getUserProfile);
router.put('/profile', protect, upload.single('avatar'), updateUserProfile);
router.post('/seed-demo', protect, seedDemoData);
router.delete('/wipe-data', protect, wipeAccountData);

export default router;
