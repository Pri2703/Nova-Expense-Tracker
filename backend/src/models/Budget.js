import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: [true, 'Budget category is required'],
      trim: true,
    },
    limit: {
      type: Number,
      required: [true, 'Budget limit is required'],
      min: [1, 'Limit must be at least 1'],
    },
    spent: {
      type: Number,
      default: 0,
      min: [0, 'Spent amount cannot be negative'],
    },
    period: {
      type: String,
      required: [true, 'Budget period is required (e.g. YYYY-MM)'],
      match: [/^\d{4}-\d{2}$/, 'Period must be in YYYY-MM format'],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate budgets for the same category and period for a user
budgetSchema.index({ user: 1, category: 1, period: 1 }, { unique: true });

const Budget = mongoose.model('Budget', budgetSchema);
export default Budget;
