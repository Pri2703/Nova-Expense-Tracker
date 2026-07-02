import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Upload, Calendar, Wallet as WalletIcon, FileText, AlertCircle, Trash2 } from 'lucide-react';
import { walletsApi, transactionsApi } from '../services/apiService';
import type { Wallet, Transaction } from '../services/apiService';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transactionToEdit?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  transactionToEdit = null,
}) => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const categories = [
    'Food & Dining',
    'Shopping',
    'Housing & Rent',
    'Entertainment',
    'Utilities',
    'Transportation',
    'Healthcare',
    'Salary & Income',
    'Investments',
    'Savings Transfer',
    'Other',
  ];

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      description: '',
      amount: '',
      type: 'expense',
      category: 'Food & Dining',
      walletId: '',
      date: new Date().toISOString().substring(0, 10),
      notes: '',
    },
  });

  const transactionType = watch('type');

  // Load wallets on component open
  useEffect(() => {
    if (isOpen) {
      const fetchWallets = async () => {
        try {
          const data = await walletsApi.getAll();
          setWallets(data);
          
          // Set default wallet if none is selected
          if (data.length > 0 && !transactionToEdit) {
            setValue('walletId', data[0]._id);
          }
        } catch (error) {
          console.error('Failed to load wallets:', error);
        }
      };

      fetchWallets();
    }
  }, [isOpen, transactionToEdit, setValue]);

  // Set form fields if editing a transaction
  useEffect(() => {
    if (isOpen && transactionToEdit) {
      reset({
        description: transactionToEdit.description,
        amount: String(transactionToEdit.amount),
        type: transactionToEdit.type,
        category: transactionToEdit.category,
        walletId: transactionToEdit.wallet._id,
        date: new Date(transactionToEdit.date).toISOString().substring(0, 10),
        notes: transactionToEdit.notes || '',
      });
      setSelectedFile(null);
    } else if (isOpen && !transactionToEdit) {
      reset({
        description: '',
        amount: '',
        type: 'expense',
        category: 'Food & Dining',
        walletId: wallets[0]?._id || '',
        date: new Date().toISOString().substring(0, 10),
        notes: '',
      });
      setSelectedFile(null);
    }
  }, [isOpen, transactionToEdit, reset, wallets]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const onSubmit = async (data: any) => {
    setApiError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append('description', data.description);
    formData.append('amount', data.amount);
    formData.append('type', data.type);
    formData.append('category', data.category);
    formData.append('walletId', data.walletId);
    formData.append('date', data.date);
    formData.append('notes', data.notes);
    if (selectedFile) {
      formData.append('receipt', selectedFile);
    }

    try {
      if (transactionToEdit) {
        await transactionsApi.update(transactionToEdit._id, formData);
      } else {
        await transactionsApi.create(formData);
      }
      reset();
      onSuccess();
      onClose();
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      
      {/* Modal Card wrapper */}
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 shadow-2xl overflow-hidden animate-scale-in">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
            {transactionToEdit ? 'Edit Transaction' : 'Add Transaction'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          
          {apiError && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 flex gap-2 text-xs text-red-700 dark:text-red-300 font-medium">
              <AlertCircle size={16} className="shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Type Toggle: Income vs Expense */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 dark:bg-slate-950 rounded-2xl">
            <button
              type="button"
              onClick={() => setValue('type', 'expense')}
              className={`py-3.5 rounded-xl font-sans font-bold text-sm tracking-wide transition-all ${
                transactionType === 'expense'
                  ? 'bg-white dark:bg-slate-900 text-red-500 shadow-sm border border-slate-200/10'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-350'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setValue('type', 'income')}
              className={`py-3.5 rounded-xl font-sans font-bold text-sm tracking-wide transition-all ${
                transactionType === 'income'
                  ? 'bg-white dark:bg-slate-900 text-brand-emerald shadow-sm border border-slate-200/10'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-350'
              }`}
            >
              Income
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Description field */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Description
              </label>
              <input
                type="text"
                placeholder="e.g. Weekly Groceries"
                className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/60 text-slate-800 dark:text-slate-200 text-xs font-sans focus:outline-none focus:border-brand-indigo transition-all ${
                  errors.description ? 'border-red-500' : ''
                }`}
                {...register('description', { required: 'Description is required' })}
              />
            </div>

            {/* Amount field */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Amount (₹)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/60 text-slate-800 dark:text-slate-200 text-xs font-sans focus:outline-none focus:border-brand-indigo transition-all ${
                  errors.amount ? 'border-red-500' : ''
                }`}
                {...register('amount', {
                  required: 'Amount is required',
                  min: { value: 0.01, message: 'Must be greater than 0' },
                })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Select */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Category
              </label>
              <select
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/60 text-slate-800 dark:text-slate-200 text-xs font-sans focus:outline-none focus:border-brand-indigo transition-all"
                {...register('category')}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Wallet Select */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <WalletIcon size={12} /> Charge Account
              </label>
              <select
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/60 text-slate-800 dark:text-slate-200 text-xs font-sans focus:outline-none focus:border-brand-indigo transition-all"
                {...register('walletId', { required: 'Please select a wallet' })}
              >
                {wallets.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.name} (₹{w.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date Field */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Calendar size={12} /> Date
              </label>
              <input
                type="date"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/60 text-slate-800 dark:text-slate-200 text-xs font-sans focus:outline-none focus:border-brand-indigo transition-all"
                {...register('date', { required: 'Date is required' })}
              />
            </div>

            {/* Receipt upload field */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Upload size={12} /> Upload Receipt (optional)
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="receipt-file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="receipt-file"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-250 dark:border-slate-800 text-slate-400 hover:text-brand-indigo hover:border-brand-indigo cursor-pointer flex items-center justify-between text-xs font-sans transition-colors"
                >
                  <span className="truncate max-w-[150px]">
                    {selectedFile ? selectedFile.name : 'Select JPG, PNG, PDF'}
                  </span>
                  <Upload size={14} className="shrink-0" />
                </label>
                {selectedFile && (
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="absolute right-9 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Notes field */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <FileText size={12} /> Transaction Notes
            </label>
            <textarea
              rows={2}
              placeholder="Add optional notes or descriptions..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/60 text-slate-800 dark:text-slate-200 text-xs font-sans focus:outline-none focus:border-brand-indigo transition-all resize-none"
              {...register('notes')}
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-950 text-xs font-bold font-sans cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-purple text-white text-xs font-bold font-sans hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer shadow-md"
            >
              {loading ? 'Saving...' : 'Save Transaction'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
