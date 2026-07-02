import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Wallet name is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Wallet type is required'],
      enum: ['cash', 'bank', 'credit_card', 'investment', 'other'],
      default: 'cash',
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
    },
    currency: {
      type: String,
      default: '₹',
    },
    color: {
      type: String,
      default: '#4F46E5', // Default Indigo theme color for UI representation
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate wallet names for the same user
walletSchema.index({ user: 1, name: 1 }, { unique: true });

const Wallet = mongoose.model('Wallet', walletSchema);
export default Wallet;
