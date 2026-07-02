import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';

// Helper: Get Period YYYY-MM
const getPeriodFromDate = (date) => {
  const d = new Date(date || Date.now());
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

// @desc    Get all budgets for user (can filter by period)
// @route   GET /api/budgets
// @access  Private
export const getBudgets = async (req, res) => {
  try {
    const { period = getPeriodFromDate() } = req.query;
    
    // Fetch user's budgets for the specific month
    const budgets = await Budget.find({ user: req.user._id, period });
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create or update budget limit for a category and period
// @route   POST /api/budgets
// @access  Private
export const createOrUpdateBudget = async (req, res) => {
  const { category, limit, period = getPeriodFromDate() } = req.body;

  try {
    const targetLimit = Number(limit);

    // Find existing budget
    let budget = await Budget.findOne({ user: req.user._id, category, period });

    if (budget) {
      // Update existing budget limit
      budget.limit = targetLimit;
      await budget.save();
    } else {
      // Calculate how much has already been spent in this category for this period
      const startOfPeriod = new Date(`${period}-01T00:00:00.000Z`);
      const year = startOfPeriod.getUTCFullYear();
      const month = startOfPeriod.getUTCMonth();
      const endOfPeriod = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

      const spentAggregation = await Transaction.aggregate([
        {
          $match: {
            user: req.user._id,
            category,
            type: 'expense',
            date: { $gte: startOfPeriod, $lte: endOfPeriod },
          },
        },
        {
          $group: {
            _id: null,
            totalSpent: { $sum: '$amount' },
          },
        },
      ]);

      const initialSpent = spentAggregation.length > 0 ? spentAggregation[0].totalSpent : 0;

      // Create new budget
      budget = await Budget.create({
        user: req.user._id,
        category,
        limit: targetLimit,
        spent: initialSpent,
        period,
      });
    }

    res.status(201).json(budget);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a budget
// @route   DELETE /api/budgets/:id
// @access  Private
export const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
