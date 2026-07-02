import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { goalsApi, walletsApi } from '../services/apiService';
import type { Goal, Wallet } from '../services/apiService';
import { PiggyBank, Trash2, ArrowUpRight, X, AlertCircle } from 'lucide-react';

export const Goals: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);

  // Funding Modal States
  const [isFundingModalOpen, setIsFundingModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [fundingAmount, setFundingAmount] = useState('');
  const [fundingWalletId, setFundingWalletId] = useState('');
  const [fundingError, setFundingError] = useState<string | null>(null);
  const [fundingLoading, setFundingLoading] = useState(false);

  // Goal Form State
  const [goalError, setGoalError] = useState<string | null>(null);

  const fetchGoalsAndWallets = async () => {
    try {
      setLoading(true);
      const goalsData = await goalsApi.getAll();
      const walletsData = await walletsApi.getAll();
      setGoals(goalsData);
      setWallets(walletsData);
      
      if (walletsData.length > 0) {
        setFundingWalletId(walletsData[0]._id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoalsAndWallets();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      targetAmount: '',
      targetDate: '',
      color: '#10B981',
    },
  });

  const onSubmitGoal = async (data: any) => {
    setGoalError(null);
    try {
      await goalsApi.create({
        name: data.name,
        targetAmount: Number(data.targetAmount),
        targetDate: data.targetDate,
        color: data.color,
      });
      reset();
      fetchGoalsAndWallets();
    } catch (err: any) {
      setGoalError(err.response?.data?.message || 'Failed to save savings goal.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this savings goal?')) {
      try {
        await goalsApi.delete(id);
        fetchGoalsAndWallets();
      } catch (e) {
        alert('Failed to delete savings goal.');
      }
    }
  };

  // Fund Transfer Execution
  const handleOpenFundingModal = (goal: Goal) => {
    setSelectedGoal(goal);
    setFundingAmount('');
    setFundingError(null);
    setIsFundingModalOpen(true);
  };

  const handleExecuteFunding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal) return;
    
    setFundingError(null);
    const amount = Number(fundingAmount);
    if (!amount || amount <= 0) {
      return setFundingError('Please enter a valid amount greater than 0.');
    }

    setFundingLoading(true);
    try {
      await goalsApi.fund(selectedGoal._id, {
        amount,
        walletId: fundingWalletId,
      });
      setIsFundingModalOpen(false);
      fetchGoalsAndWallets();
    } catch (err: any) {
      setFundingError(err.response?.data?.message || 'Failed to transfer funds.');
    } finally {
      setFundingLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
          Savings Targets & Milestones
        </h2>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Create wealth triggers, track progress, and allocate funds from your wallets
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Create Goal Form */}
        <div className="lg:col-span-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex flex-col space-y-4">
            <div>
              <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <PiggyBank size={18} className="text-brand-emerald" /> Establish Savings Target
              </h3>
              <span className="text-[10px] text-slate-450">Set a wealth goal for the future</span>
            </div>

            <form onSubmit={handleSubmit(onSubmitGoal)} className="space-y-4">
              {goalError && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/45 text-xs text-red-700 dark:text-red-300 font-medium">
                  {goalError}
                </div>
              )}

              {/* Goal Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Goal Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. New Macbook Pro"
                  className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800/60 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-brand-indigo ${
                    errors.name ? 'border-red-500' : ''
                  }`}
                  {...register('name', { required: 'Goal name is required' })}
                />
                {errors.name && (
                  <span className="text-[10px] text-red-500 block">{errors.name.message}</span>
                )}
              </div>

              {/* Target Amount */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Target Goal Amount (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 150000"
                  className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800/60 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-brand-indigo ${
                    errors.targetAmount ? 'border-red-500' : ''
                  }`}
                  {...register('targetAmount', {
                    required: 'Target amount is required',
                    min: { value: 1, message: 'Goal target must be at least ₹1' },
                  })}
                />
                {errors.targetAmount && (
                  <span className="text-[10px] text-red-500 block">{errors.targetAmount.message}</span>
                )}
              </div>

              {/* Target Date */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Target Achievement Date
                </label>
                <input
                  type="date"
                  className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800/60 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-brand-indigo ${
                    errors.targetDate ? 'border-red-500' : ''
                  }`}
                  {...register('targetDate', { required: 'Target date is required' })}
                />
                {errors.targetDate && (
                  <span className="text-[10px] text-red-500 block">{errors.targetDate.message}</span>
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
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-indigo to-brand-emerald text-white text-xs font-bold font-sans shadow-md hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                Create Target Goal
              </button>
            </form>
          </div>
        </div>

        {/* Goals Progress list */}
        <div className="lg:col-span-8">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex flex-col space-y-6">
            <div>
              <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-200">
                Current Goals Tracker
              </h3>
              <span className="text-[10px] text-slate-400">Track and allocate savings towards targets</span>
            </div>

            {loading ? (
              <div className="py-12 flex justify-center items-center">
                <div className="w-8 h-8 rounded-full border-2 border-slate-200 dark:border-slate-800 border-t-brand-indigo animate-spin"></div>
              </div>
            ) : goals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {goals.map((g) => {
                  const percent = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
                  return (
                    <div
                      key={g._id}
                      className="p-5 rounded-2xl bg-slate-50/40 dark:bg-slate-950/20 border border-slate-200/30 dark:border-slate-800/40 flex flex-col justify-between space-y-5 hover:translate-y-[-2px] transition-all group relative overflow-hidden"
                    >
                      {/* Decorative background glow */}
                      <div
                        className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10"
                        style={{ backgroundColor: g.color }}
                      ></div>

                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {g.name}
                          </h4>
                          <span className="text-[9px] text-slate-400 font-sans block mt-0.5">
                            Target Date: {new Date(g.targetDate).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(g._id)}
                            className="p-1 rounded text-slate-450 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                            title="Delete savings target"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Savings Balance Display */}
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-display font-extrabold text-slate-900 dark:text-white">
                          ₹{g.currentAmount.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-450">
                          saved of ₹{g.targetAmount.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1.5">
                        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-850 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%`, backgroundColor: g.color }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-450 dark:text-slate-500">
                          <span>{percent}% Completed</span>
                          <span>Left: ₹{Math.max(0, g.targetAmount - g.currentAmount).toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      {/* Fund Allocation CTA */}
                      {percent < 100 && (
                        <button
                          onClick={() => handleOpenFundingModal(g)}
                          className="w-full mt-1.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold font-sans hover:bg-brand-emerald hover:text-white hover:border-brand-emerald transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          Fund Goal <ArrowUpRight size={13} />
                        </button>
                      )}

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 text-slate-450 dark:text-slate-500 text-xs">
                No active savings goals. Set one using the panel on the left!
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Fund Transfer Overlay Modal */}
      {isFundingModalOpen && selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 shadow-2xl overflow-hidden animate-scale-in">
            
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                Fund Goal: {selectedGoal.name}
              </h3>
              <button
                onClick={() => setIsFundingModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleExecuteFunding} className="p-5 space-y-4">
              {fundingError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 flex gap-1.5 text-xs text-red-700 dark:text-red-300 font-medium">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{fundingError}</span>
                </div>
              )}

              {/* Fund amount */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                  Funding Amount (₹)
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={fundingAmount}
                  onChange={(e) => setFundingAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800/60 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-brand-emerald"
                  required
                />
              </div>

              {/* Source Account/Wallet */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                  Source Wallet Account
                </label>
                <select
                  value={fundingWalletId}
                  onChange={(e) => setFundingWalletId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800/60 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-brand-emerald"
                >
                  {wallets.map((w) => (
                    <option key={w._id} value={w._id}>
                      {w.name} (Balance: ₹{w.balance.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFundingModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-250 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-950 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={fundingLoading}
                  className="flex-1 py-2.5 rounded-xl bg-brand-emerald text-white text-xs font-bold hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {fundingLoading ? 'Transferring...' : 'Transfer Funds'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
export default Goals;
