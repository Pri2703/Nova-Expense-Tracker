import Transaction from '../models/Transaction.js';
import Wallet from '../models/Wallet.js';
import Budget from '../models/Budget.js';
import { uploadToCloudinary } from '../middleware/uploadMiddleware.js';

// Helper: Format Date to YYYY-MM for budgets
const getPeriodFromDate = (dateString) => {
  const date = new Date(dateString || Date.now());
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

// @desc    Get transactions with filters, search, sorting, and pagination
// @route   GET /api/transactions
// @access  Private
export const getTransactions = async (req, res) => {
  try {
    const {
      search,
      category,
      walletId,
      type,
      startDate,
      endDate,
      sortBy = 'date',
      order = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const query = { user: req.user._id };

    // Apply filters
    if (search) {
      query.description = { $regex: search, $options: 'i' };
    }
    if (category) {
      query.category = category;
    }
    if (walletId) {
      query.wallet = walletId;
    }
    if (type) {
      query.type = type;
    }
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder;

    // Execute query with pagination
    const totalTransactions = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .populate('wallet', 'name type color')
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      transactions,
      page: Number(page),
      pages: Math.ceil(totalTransactions / limit),
      total: totalTransactions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create transaction and update wallet balance and budget spent
// @route   POST /api/transactions
// @access  Private
export const createTransaction = async (req, res) => {
  const { description, amount, type, category, date, walletId, notes } = req.body;

  try {
    const wallet = await Wallet.findOne({ _id: walletId, user: req.user._id });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    const parsedAmount = Number(amount);
    let receiptUrl = '';

    // Handle receipt file upload if present
    if (req.file) {
      receiptUrl = await uploadToCloudinary(req.file.path, 'nova/receipts');
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      wallet: walletId,
      description,
      amount: parsedAmount,
      type,
      category: category || 'Other',
      date: date || Date.now(),
      notes,
      receiptUrl,
    });

    // Update wallet balance
    if (type === 'income') {
      wallet.balance += parsedAmount;
    } else {
      wallet.balance -= parsedAmount;
    }
    await wallet.save();

    // Update matching budget (if expense)
    if (type === 'expense') {
      const period = getPeriodFromDate(transaction.date);
      const budget = await Budget.findOne({
        user: req.user._id,
        category: transaction.category,
        period,
      });

      if (budget) {
        budget.spent += parsedAmount;
        await budget.save();
      }
    }

    // Populate wallet info for the response
    const populatedTransaction = await Transaction.findById(transaction._id).populate(
      'wallet',
      'name type color'
    );

    res.status(201).json(populatedTransaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update transaction, adjust wallet balances and budgets
// @route   PUT /api/transactions/:id
// @access  Private
export const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const originalWalletId = transaction.wallet;
    const originalAmount = transaction.amount;
    const originalType = transaction.type;
    const originalCategory = transaction.category;
    const originalDate = transaction.date;

    const { description, amount, type, category, date, walletId, notes } = req.body;

    const newWalletId = walletId || originalWalletId;
    const newAmount = amount !== undefined ? Number(amount) : originalAmount;
    const newType = type || originalType;
    const newCategory = category || originalCategory;
    const newDate = date || originalDate;

    // Handle receipt file upload if present
    if (req.file) {
      transaction.receiptUrl = await uploadToCloudinary(req.file.path, 'nova/receipts');
    }

    // REVERT OLD WALLET BALANCE CHANGE
    const oldWallet = await Wallet.findOne({ _id: originalWalletId, user: req.user._id });
    if (oldWallet) {
      if (originalType === 'income') {
        oldWallet.balance -= originalAmount;
      } else {
        oldWallet.balance += originalAmount;
      }
      await oldWallet.save();
    }

    // APPLY NEW WALLET BALANCE CHANGE
    const newWallet = await Wallet.findOne({ _id: newWalletId, user: req.user._id });
    if (!newWallet) {
      return res.status(404).json({ message: 'Target wallet not found' });
    }
    if (newType === 'income') {
      newWallet.balance += newAmount;
    } else {
      newWallet.balance -= newAmount;
    }
    await newWallet.save();

    // REVERT OLD BUDGET SPENT
    if (originalType === 'expense') {
      const oldPeriod = getPeriodFromDate(originalDate);
      const oldBudget = await Budget.findOne({
        user: req.user._id,
        category: originalCategory,
        period: oldPeriod,
      });
      if (oldBudget) {
        oldBudget.spent = Math.max(0, oldBudget.spent - originalAmount);
        await oldBudget.save();
      }
    }

    // APPLY NEW BUDGET SPENT
    if (newType === 'expense') {
      const newPeriod = getPeriodFromDate(newDate);
      const newBudget = await Budget.findOne({
        user: req.user._id,
        category: newCategory,
        period: newPeriod,
      });
      if (newBudget) {
        newBudget.spent += newAmount;
        await newBudget.save();
      }
    }

    // Save transaction updates
    transaction.description = description || transaction.description;
    transaction.amount = newAmount;
    transaction.type = newType;
    transaction.category = newCategory;
    transaction.date = newDate;
    transaction.wallet = newWalletId;
    transaction.notes = notes !== undefined ? notes : transaction.notes;

    await transaction.save();

    const populatedTransaction = await Transaction.findById(transaction._id).populate(
      'wallet',
      'name type color'
    );

    res.json(populatedTransaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete transaction and revert wallet balance and budget spent
// @route   DELETE /api/transactions/:id
// @access  Private
export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // REVERT WALLET BALANCE CHANGE
    const wallet = await Wallet.findOne({ _id: transaction.wallet, user: req.user._id });
    if (wallet) {
      if (transaction.type === 'income') {
        wallet.balance -= transaction.amount;
      } else {
        wallet.balance += transaction.amount;
      }
      await wallet.save();
    }

    // REVERT BUDGET SPENT
    if (transaction.type === 'expense') {
      const period = getPeriodFromDate(transaction.date);
      const budget = await Budget.findOne({
        user: req.user._id,
        category: transaction.category,
        period,
      });

      if (budget) {
        budget.spent = Math.max(0, budget.spent - transaction.amount);
        await budget.save();
      }
    }

    await transaction.deleteOne();
    res.json({ message: 'Transaction deleted and wallet/budget adjusted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
