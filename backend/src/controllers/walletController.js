import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';

// @desc    Get all wallets for logged-in user
// @route   GET /api/wallets
// @access  Private
export const getWallets = async (req, res) => {
  try {
    const wallets = await Wallet.find({ user: req.user._id });
    res.json(wallets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new wallet
// @route   POST /api/wallets
// @access  Private
export const createWallet = async (req, res) => {
  const { name, type, balance, color } = req.body;

  try {
    // Check if wallet name already exists for this user
    const walletExists = await Wallet.findOne({ user: req.user._id, name });
    if (walletExists) {
      return res.status(400).json({ message: 'A wallet with this name already exists' });
    }

    const wallet = await Wallet.create({
      user: req.user._id,
      name,
      type,
      balance: balance || 0,
      color: color || '#4F46E5',
      currency: req.user.currency || '₹',
    });

    res.status(201).json(wallet);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a wallet
// @route   PUT /api/wallets/:id
// @access  Private
export const updateWallet = async (req, res) => {
  const { name, type, balance, color } = req.body;

  try {
    const wallet = await Wallet.findOne({ _id: req.params.id, user: req.user._id });

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    // Check if name is being changed and if it conflicts with another wallet
    if (name && name !== wallet.name) {
      const nameExists = await Wallet.findOne({ user: req.user._id, name });
      if (nameExists) {
        return res.status(400).json({ message: 'Another wallet with this name already exists' });
      }
      wallet.name = name;
    }

    if (type) wallet.type = type;
    if (color) wallet.color = color;
    
    // Balance manual adjustment
    if (balance !== undefined) {
      wallet.balance = balance;
    }

    const updatedWallet = await wallet.save();
    res.json(updatedWallet);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a wallet
// @route   DELETE /api/wallets/:id
// @access  Private
export const deleteWallet = async (req, res) => {
  try {
    // Check if it's the last wallet
    const walletCount = await Wallet.countDocuments({ user: req.user._id });
    if (walletCount <= 1) {
      return res.status(400).json({ message: 'You must keep at least one wallet' });
    }

    const wallet = await Wallet.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    // Delete all transactions associated with this wallet
    await Transaction.deleteMany({ wallet: req.params.id });

    res.json({ message: 'Wallet and its transactions deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
