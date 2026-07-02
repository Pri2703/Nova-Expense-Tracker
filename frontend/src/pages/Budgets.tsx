import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { budgetsApi } from '../services/apiService';
import type { Budget } from '../services/apiService';
import { AlertCircle, PieChart, Trash2, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export const Budgets: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const categories = [
    'Food & Dining',
    'Shopping',
    'Housing & Rent',
    'Entertainment',
    'Utilities',
    'Transportation',
    'Healthcare',
    'Investments',
    'Other',
  ];

  const currentPeriod = new Date().toISOString().substring(0, 7); // YYYY-MM

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const data = await budgetsApi.getAll(currentPeriod);
      setBudgets(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      category: 'Food & Dining',
      limit: '',
    },
  });

  const onSubmit = async (data: any) => {
    setFormError(null);
    try {
      await budgetsApi.createOrUpdate({
        category: data.category,
        limit: Number(data.limit),
        period: currentPeriod,
      });
      reset();
      fetchBudgets();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save budget plan.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this budget limit?')) {
      try {
        await budgetsApi.delete(id);
        fetchBudgets();
      } catch (e) {
        alert('Failed to delete budget.');
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
          Budgets & Category Planning
        </h2>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Establish monthly limits for spending categories to govern your expenses
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Create/Adjust Budget Form */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex flex-col space-y-4">
            <div>
              <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <PieChart size={18} className="text-brand-indigo" /> Configure Budget Limit
              </h3>
              <span className="text-[10px] text-slate-450">Set a cap for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-xs text-red-700 dark:text-red-300 font-medium">
                  {formError}
                </div>
              )}

              {/* Category Select */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Category
                </label>
                <select
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800/60 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-brand-indigo"
                  {...register('category')}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Limit input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Monthly Limit Amount (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 15000"
                  className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800/60 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-brand-indigo ${
                    errors.limit ? 'border-red-500' : ''
                  }`}
                  {...register('limit', {
                    required: 'Limit amount is required',
                    min: { value: 1, message: 'Limit must be at least ₹1' },
                  })}
                />
                {errors.limit && (
                  <span className="text-[10px] text-red-500 block">{errors.limit.message}</span>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-indigo to-brand-purple text-white text-xs font-bold font-sans shadow-md hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Apply Budget Plan <ArrowRight size={14} />
              </button>
            </form>
          </div>
          
          {/* Helpful tips panel */}
          <div className="p-5 rounded-2xl bg-brand-indigo/5 border border-brand-indigo/10 text-xs text-brand-indigo dark:text-brand-indigo-light space-y-2 leading-relaxed">
            <span className="font-bold flex items-center gap-1">💡 Smart Budget Updates</span>
            <p>If you establish a budget for a category that already has expense transactions this month, Nova aggregates them and automatically computes your initial progress.</p>
          </div>
        </div>

        {/* Budgets Progress Grid */}
        <div className="lg:col-span-8">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex flex-col space-y-6">
            <div>
              <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-200">
                Active Budgets Summary
              </h3>
              <span className="text-[10px] text-slate-400">Monthly limits tracking cards</span>
            </div>

            {loading ? (
              <div className="py-12 flex justify-center items-center">
                <div className="w-8 h-8 rounded-full border-2 border-slate-200 dark:border-slate-800 border-t-brand-indigo animate-spin"></div>
              </div>
            ) : budgets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {budgets.map((b) => {
                  const percent = Math.min(100, Math.round((b.spent / b.limit) * 100));
                  const isDanger = b.spent >= b.limit;
                  const isWarning = b.spent >= b.limit * 0.8 && b.spent < b.limit;

                  return (
                    <div
                      key={b._id}
                      className="p-5 rounded-2xl bg-slate-50/40 dark:bg-slate-950/20 border border-slate-200/30 dark:border-slate-800/40 flex flex-col justify-between space-y-4 hover:translate-y-[-2px] transition-all group relative"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {b.category}
                          </h4>
                          <span className="text-[9px] text-slate-400">
                            Cap: ₹{b.limit.toLocaleString('en-IN')}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          {isDanger ? (
                            <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-950/20 text-red-500 text-[8px] font-bold tracking-wide uppercase flex items-center gap-0.5">
                              <AlertCircle size={8} /> Exceeded
                            </span>
                          ) : isWarning ? (
                            <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/20 text-amber-500 text-[8px] font-bold tracking-wide uppercase flex items-center gap-0.5">
                              <AlertTriangle size={8} /> Warning
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-brand-emerald/10 text-brand-emerald text-[8px] font-bold tracking-wide uppercase flex items-center gap-0.5">
                              <CheckCircle2 size={8} /> OK
                            </span>
                          )}
                          
                          <button
                            onClick={() => handleDelete(b._id)}
                            className="p-1 rounded text-slate-450 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                            title="Remove budget"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Progress meter bar */}
                      <div className="space-y-1.5">
                        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-850 overflow-hidden relative">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isDanger ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-brand-emerald'
                            }`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-slate-450 dark:text-slate-500">
                          <span>Spent: ₹{b.spent.toLocaleString('en-IN')} ({percent}%)</span>
                          <span>Left: ₹{Math.max(0, b.limit - b.spent).toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 text-slate-450 dark:text-slate-500 text-xs">
                No active category budgets established. Set one using the panel on the left!
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
export default Budgets;
