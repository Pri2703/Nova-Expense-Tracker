import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { walletsApi } from '../services/apiService';
import type { Wallet } from '../services/apiService';
import { CreditCard, Trash2, Edit3, X, AlertCircle } from 'lucide-react';

export const Wallets: React.FC = () => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Wallet Form State
  const [formError, setFormError] = useState<string | null>(null);
  
  // Edit Balance State
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [newBalance, setNewBalance] = useState('');
  const [isEditingOpen, setIsEditingOpen] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const data = await walletsApi.getAll();
      setWallets(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      type: 'cash',
      balance: '',
      color: '#4F46E5',
    },
  });

  const onSubmitWallet = async (data: any) => {
    setFormError(null);
    try {
      await walletsApi.create({
        name: data.name,
        type: data.type,
        balance: Number(data.balance),
        color: data.color,
      });
      reset();
      fetchWallets();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create wallet account.');
    }
  };

  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        'WARNING: Deleting this wallet will permanently delete all associated transactions. Are you sure you want to continue?'
      )
    ) {
      try {
        await walletsApi.delete(id);
        fetchWallets();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete wallet.');
      }
    }
  };

  // Balance edit triggers
  const handleOpenEdit = (w: Wallet) => {
    setEditingWallet(w);
    setNewBalance(String(w.balance));
    setEditError(null);
    setIsEditingOpen(true);
  };

  const handleSaveBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWallet) return;

    setEditError(null);
    const balanceNum = Number(newBalance);
    if (isNaN(balanceNum)) {
      return setEditError('Please enter a valid numeric balance.');
    }

    setEditLoading(true);
    try {
      await walletsApi.update(editingWallet._id, {
        balance: balanceNum,
      });
      setIsEditingOpen(false);
      fetchWallets();
    } catch (err: any) {
      setEditError(err.response?.data?.message || 'Failed to update balance.');
    } finally {
      setEditLoading(false);
    }
  };

  // Helper to format credit card numbers nicely
  const getCardNumber = (index: number) => {
    const defaultNumbers = ['4392 8402 1294 9283', '5219 9402 8593 1042', '4120 4092 8840 9283'];
    return defaultNumbers[index % defaultNumbers.length];
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
          Wallets & Accounts
        </h2>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Manage digital cards representing your bank accounts, credit cards, physical cash or investments
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Create Wallet Form */}
        <div className="lg:col-span-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex flex-col space-y-4">
            <div>
              <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <CreditCard size={18} className="text-brand-indigo" /> Add Wallet Account
              </h3>
              <span className="text-[10px] text-slate-450">Initialize a new financial account</span>
            </div>

            <form onSubmit={handleSubmit(onSubmitWallet)} className="space-y-4">
              {formError && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/45 text-xs text-red-700 dark:text-red-300 font-medium">
                  {formError}
                </div>
              )}

              {/* Wallet Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Account Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chase Checkings"
                  className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800/60 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-brand-indigo ${
                    errors.name ? 'border-red-500' : ''
                  }`}
                  {...register('name', { required: 'Wallet name is required' })}
                />
                {errors.name && (
                  <span className="text-[10px] text-red-500 block">{errors.name.message}</span>
                )}
              </div>

              {/* Account Type */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Account Type
                </label>
                <select
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800/60 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-brand-indigo"
                  {...register('type')}
                >
                  <option value="cash">💵 Cash / Wallet</option>
                  <option value="bank">🏛️ Bank Checkings / Savings</option>
                  <option value="credit_card">💳 Credit Card</option>
                  <option value="investment">📈 Investment Brokerage</option>
                  <option value="other">⚙️ Other Account</option>
                </select>
              </div>

              {/* Initial Balance */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Starting Balance (₹)
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800/60 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-brand-indigo ${
                    errors.balance ? 'border-red-500' : ''
                  }`}
                  {...register('balance', {
                    required: 'Starting balance is required',
                  })}
                />
                {errors.balance && (
                  <span className="text-[10px] text-red-500 block">{errors.balance.message}</span>
                )}
              </div>

              {/* Color picker */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Visual theme color
                </label>
                <input
                  type="color"
                  className="w-full h-10 p-0.5 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer bg-slate-50 dark:bg-slate-950"
                  {...register('color')}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-indigo to-brand-purple text-white text-xs font-bold font-sans shadow-md hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                Create Account Card
              </button>
            </form>
          </div>
        </div>

        {/* Digital Wallet Grid */}
        <div className="lg:col-span-8">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex flex-col space-y-6">
            <div>
              <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-200">
                Your Wallet Cards
              </h3>
              <span className="text-[10px] text-slate-400">Manage balances and delete accounts</span>
            </div>

            {loading ? (
              <div className="py-12 flex justify-center items-center">
                <div className="w-8 h-8 rounded-full border-2 border-slate-200 dark:border-slate-800 border-t-brand-indigo animate-spin"></div>
              </div>
            ) : wallets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {wallets.map((w, index) => {
                  return (
                    <div
                      key={w._id}
                      className="rounded-2xl text-white space-y-6 shadow-xl relative overflow-hidden flex flex-col justify-between p-6 transform hover:scale-[1.01] transition-transform duration-300 group"
                      style={{
                        background: `linear-gradient(135deg, ${w.color || '#4F46E5'} 0%, ${w.color}dd 100%)`,
                        boxShadow: `0 10px 25px -10px ${w.color || '#4f46e5'}66`,
                      }}
                    >
                      {/* Card Glass Reflection Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 pointer-events-none"></div>

                      <div className="flex justify-between items-start z-10">
                        <div>
                          <span className="text-[10px] text-white/60 uppercase tracking-widest font-sans font-bold">
                            {w.type === 'cash'
                              ? '💵 Cash Wallet'
                              : w.type === 'bank'
                              ? '🏛️ Bank Account'
                              : w.type === 'credit_card'
                              ? '💳 Credit Card'
                              : w.type === 'investment'
                              ? '📈 Investment Account'
                              : '⚙️ Account'}
                          </span>
                          <h4 className="font-display font-extrabold text-lg tracking-tight mt-0.5">
                            {w.name}
                          </h4>
                        </div>
                        
                        {/* Actions overlay */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(w)}
                            className="p-1.5 rounded-lg bg-white/15 hover:bg-white/30 text-white transition-colors cursor-pointer"
                            title="Adjust wallet balance"
                          >
                            <Edit3 size={12} />
                          </button>
                          <button
                            onClick={() => handleDelete(w._id)}
                            className="p-1.5 rounded-lg bg-white/15 hover:bg-red-650/40 text-white transition-colors cursor-pointer"
                            title="Delete wallet"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Balance info */}
                      <div className="pt-4 z-10">
                        <span className="text-[10px] text-white/60 uppercase">Available Balance</span>
                        <div className="font-display font-extrabold text-2xl md:text-3xl tracking-tight mt-0.5">
                          ₹{w.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                      </div>

                      {/* Mock Credit Card numbers */}
                      <div className="flex justify-between items-center text-xs text-white/50 pt-2 font-mono z-10">
                        <span>{getCardNumber(index)}</span>
                        <span className="px-2 py-0.5 rounded bg-white/20 text-white font-sans font-semibold text-[10px]">
                          Active
                        </span>
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 text-slate-450 dark:text-slate-500 text-xs">
                No wallets created. Create one on the left!
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Adjust Balance Dialog Overlay */}
      {isEditingOpen && editingWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 shadow-2xl overflow-hidden animate-scale-in">
            
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                Adjust Balance: {editingWallet.name}
              </h3>
              <button
                onClick={() => setIsEditingOpen(false)}
                className="p-1 rounded text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveBalance} className="p-5 space-y-4">
              {editError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 flex gap-1.5 text-xs text-red-700 dark:text-red-300 font-medium">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                  New Ledger Balance (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800/60 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-brand-indigo"
                  required
                />
                <span className="text-[9px] text-slate-400 font-sans block mt-1">
                  Note: This manually overrides the account balance directly without creating a transaction row.
                </span>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-250 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-950 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 py-2.5 rounded-xl bg-brand-indigo text-white text-xs font-bold hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {editLoading ? 'Saving...' : 'Save Adjustments'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
export default Wallets;
