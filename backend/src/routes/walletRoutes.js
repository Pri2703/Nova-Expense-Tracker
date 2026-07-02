import express from 'express';
import {
  getWallets,
  createWallet,
  updateWallet,
  deleteWallet,
} from '../controllers/walletController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All wallet routes require token authentication

router.route('/')
  .get(getWallets)
  .post(createWallet);

router.route('/:id')
  .put(updateWallet)
  .delete(deleteWallet);

export default router;
