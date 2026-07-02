import User from '../models/User.js';
import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import Goal from '../models/Goal.js';
import jwt from 'jsonwebtoken';
import { uploadToCloudinary } from '../middleware/uploadMiddleware.js';

// Token generation helpers
const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_ACCESS_SECRET, { expiresIn: '1h' }); // 1 hour access token
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' }); // 7 days refresh token
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      // Save refresh token to user array
      user.refreshTokens.push(refreshToken);
      await user.save();

      // Create a default wallet for the new user
      await Wallet.create({
        user: user._id,
        name: 'Cash Wallet',
        type: 'cash',
        balance: 0,
        currency: '₹',
        color: '#10B981', // Emerald green
      });

      // Set refresh token in HttpOnly cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        currency: user.currency,
        accessToken,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      // Save refresh token to user
      user.refreshTokens.push(refreshToken);
      await user.save();

      // Set refresh token in HttpOnly cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        currency: user.currency,
        accessToken,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
export const refresh = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token provided' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Swap old refresh token with the new one
    user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    // Set new refresh token in HttpOnly cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken, // also return it for clients that don't support cookies easily
    });
  } catch (error) {
    res.status(403).json({ message: 'Refresh token expired or invalid' });
  }
};

// @desc    Logout user / clear tokens
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  try {
    if (refreshToken) {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.id);
      if (user) {
        // Remove token from database
        user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
        await user.save();
      }
    }

    // Clear client cookies
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile details / avatar
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.currency = req.body.currency || user.currency;

      if (req.body.password) {
        user.password = req.body.password;
      }

      if (req.file) {
        const avatarUrl = await uploadToCloudinary(req.file.path, 'nova/avatars');
        user.avatar = avatarUrl;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        currency: updatedUser.currency,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Seed mock data for sandbox demo
// @route   POST /api/auth/seed-demo
// @access  Private
export const seedDemoData = async (req, res) => {
  const userId = req.user._id;

  try {
    // 1. Wipe existing data for this user
    await Wallet.deleteMany({ user: userId });
    await Transaction.deleteMany({ user: userId });
    await Budget.deleteMany({ user: userId });
    await Goal.deleteMany({ user: userId });

    // 2. Create wallets
    const hdfc = await Wallet.create({
      user: userId,
      name: 'HDFC Checking',
      type: 'bank',
      balance: 68900,
      currency: '₹',
      color: '#4F46E5', // Indigo
    });

    const cash = await Wallet.create({
      user: userId,
      name: 'Cash Wallet',
      type: 'cash',
      balance: 3450,
      currency: '₹',
      color: '#10B981', // Emerald
    });

    const chase = await Wallet.create({
      user: userId,
      name: 'Chase Sapphire Credit',
      type: 'credit_card',
      balance: -15200, // debt/spend
      currency: '₹',
      color: '#1E293B', // Slate
    });

    // 3. Create savings goals
    await Goal.create({
      user: userId,
      name: 'Europe Vacation',
      targetAmount: 200500,
      currentAmount: 50000,
      targetDate: new Date('2027-06-30'),
      color: '#8B5CF6',
    });

    await Goal.create({
      user: userId,
      name: 'Tesla Model Y',
      targetAmount: 1500000,
      currentAmount: 250000,
      targetDate: new Date('2028-12-31'),
      color: '#10B981',
    });

    const currentPeriod = new Date().toISOString().substring(0, 7); // YYYY-MM

    // 4. Create budgets
    await Budget.create({
      user: userId,
      category: 'Food & Dining',
      limit: 12000,
      spent: 8420,
      period: currentPeriod,
    });

    await Budget.create({
      user: userId,
      category: 'Entertainment',
      limit: 5000,
      spent: 1290,
      period: currentPeriod,
    });

    await Budget.create({
      user: userId,
      category: 'Shopping',
      limit: 15000,
      spent: 11200,
      period: currentPeriod,
    });

    // 5. Create transactions
    // Incomes
    await Transaction.create({
      user: userId,
      wallet: hdfc._id,
      description: 'Monthly Salary Credit',
      amount: 95000,
      type: 'income',
      category: 'Salary & Income',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      notes: 'Corporate salary credit from payroll.',
    });

    await Transaction.create({
      user: userId,
      wallet: hdfc._id,
      description: 'Freelance Design Project',
      amount: 15000,
      type: 'income',
      category: 'Salary & Income',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      notes: 'Final payment for Nova mockup design.',
    });

    // Expenses - Food (total: 8420)
    await Transaction.create({
      user: userId,
      wallet: cash._id,
      description: 'Local Grocery Market',
      amount: 2420,
      type: 'expense',
      category: 'Food & Dining',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      notes: 'Weekly fresh vegetables and dairy.',
    });

    await Transaction.create({
      user: userId,
      wallet: chase._id,
      description: 'Premium Sushi Dinner',
      amount: 6000,
      type: 'expense',
      category: 'Food & Dining',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      notes: 'Dinner meeting with team.',
    });

    // Expenses - Shopping (total: 11200)
    await Transaction.create({
      user: userId,
      wallet: chase._id,
      description: 'Zara Winter Jacket',
      amount: 8200,
      type: 'expense',
      category: 'Shopping',
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    });

    await Transaction.create({
      user: userId,
      wallet: cash._id,
      description: 'Leather Belt Shop',
      amount: 3000,
      type: 'expense',
      category: 'Shopping',
      date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    });

    // Expenses - Entertainment (total: 1290)
    await Transaction.create({
      user: userId,
      wallet: chase._id,
      description: 'Movie IMAX Tickets',
      amount: 890,
      type: 'expense',
      category: 'Entertainment',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    });

    await Transaction.create({
      user: userId,
      wallet: chase._id,
      description: 'Spotify Premium annual',
      amount: 400,
      type: 'expense',
      category: 'Entertainment',
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    });

    // General Expenses
    await Transaction.create({
      user: userId,
      wallet: hdfc._id,
      description: 'Monthly Apartment Rent',
      amount: 25000,
      type: 'expense',
      category: 'Housing & Rent',
      date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    });

    await Transaction.create({
      user: userId,
      wallet: hdfc._id,
      description: 'Electricity & Broadband Bill',
      amount: 4500,
      type: 'expense',
      category: 'Utilities',
      date: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
    });

    res.json({ message: 'Demo data seeded successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Wipe all account data ledger
// @route   DELETE /api/auth/wipe-data
// @access  Private
export const wipeAccountData = async (req, res) => {
  const userId = req.user._id;

  try {
    await Wallet.deleteMany({ user: userId });
    await Transaction.deleteMany({ user: userId });
    await Budget.deleteMany({ user: userId });
    await Goal.deleteMany({ user: userId });

    // Seed back a single blank cash wallet so the user is not broken
    await Wallet.create({
      user: userId,
      name: 'Cash Wallet',
      type: 'cash',
      balance: 0,
      currency: req.user.currency || '₹',
      color: '#10B981',
    });

    res.json({ message: 'All account data ledger wiped successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
