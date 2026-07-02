import express from 'express';
import {
  getGoals,
  createGoal,
  updateGoal,
  addFundsToGoal,
  deleteGoal,
} from '../controllers/goalController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All savings goal routes require token authentication

router.route('/')
  .get(getGoals)
  .post(createGoal);

router.route('/:id')
  .put(updateGoal)
  .delete(deleteGoal);

router.post('/:id/fund', addFundsToGoal);

export default router;
