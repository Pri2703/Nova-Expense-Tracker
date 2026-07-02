import Goal from '../models/Goal.js';
import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';

// @desc    Get all savings goals for user
// @route   GET /api/goals
// @access  Private
export const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).sort({ targetDate: 1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new savings goal
// @route   POST /api/goals
// @access  Private
export const createGoal = async (req, res) => {
  const { name, targetAmount, currentAmount, targetDate, color } = req.body;

  try {
    const goal = await Goal.create({
      user: req.user._id,
      name,
      targetAmount,
      currentAmount: currentAmount || 0,
      targetDate,
      color: color || '#10B981',
    });

    res.status(201).json(goal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a savings goal
// @route   PUT /api/goals/:id
// @access  Private
export const updateGoal = async (req, res) => {
  const { name, targetAmount, currentAmount, targetDate, color } = req.body;

  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });

    if (!goal) {
      return res.status(404).json({ message: 'Savings goal not found' });
    }

    if (name) goal.name = name;
    if (targetAmount !== undefined) goal.targetAmount = targetAmount;
    if (currentAmount !== undefined) goal.currentAmount = currentAmount;
    if (targetDate) goal.targetDate = targetDate;
    if (color) goal.color = color;

    const updatedGoal = await goal.save();
    res.json(updatedGoal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Add funds to a savings goal from a wallet (Transfer transaction)
// @route   POST /api/goals/:id/fund
// @access  Private
export const addFundsToGoal = async (req, res) => {
  const { amount, walletId } = req.body;

  try {
    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      return res.status(400).json({ message: 'Please provide a valid funding amount greater than zero' });
    }

    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) {
      return res.status(404).json({ message: 'Savings goal not found' });
    }

    const wallet = await Wallet.findOne({ _id: walletId, user: req.user._id });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    if (wallet.balance < parsedAmount) {
      return res.status(400).json({ message: 'Insufficient balance in the selected wallet' });
    }

    // 1. Debit the wallet
    wallet.balance -= parsedAmount;
    await wallet.save();

    // 2. Credit the goal
    goal.currentAmount += parsedAmount;
    await goal.save();

    // 3. Create a transaction record to log the transfer
    const transaction = await Transaction.create({
      user: req.user._id,
      wallet: walletId,
      description: `Funded Savings Goal: ${goal.name}`,
      amount: parsedAmount,
      type: 'expense',
      category: 'Savings',
      date: Date.now(),
      notes: `Transferred from ${wallet.name} to target savings goal "${goal.name}".`,
    });

    res.json({
      goal,
      wallet,
      transaction,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a savings goal
// @route   DELETE /api/goals/:id
// @access  Private
export const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!goal) {
      return res.status(404).json({ message: 'Savings goal not found' });
    }

    res.json({ message: 'Savings goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
