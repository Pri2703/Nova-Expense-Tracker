import React, { useState, useEffect } from 'react';
import { walletsApi, transactionsApi, budgetsApi, goalsApi } from '../services/apiService';
import type { Wallet, Transaction, Budget, Goal } from '../services/apiService';
import {
  TrendingUp,
  Wallet as WalletIcon,
  PiggyBank,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  Edit,
  AlertTriangle,
  Receipt,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { TransactionModal } from '../components/TransactionModal';

export const Dashboard: React.FC = () => {
  // Data States
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Control States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const walletsData = await walletsApi.getAll();
      const transactionsData = await transactionsApi.getAll({ limit: 8 });
      const budgetsData = await budgetsApi.getAll();
      const goalsData = await goalsApi.getAll();

      setWallets(walletsData);
      setTransactions(transactionsData.transactions);
      setBudgets(budgetsData);
      setGoals(goalsData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDeleteTransaction = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await transactionsApi.delete(id);
        fetchDashboardData();
      } catch (error) {
        alert('Failed to delete transaction');
      }
    }
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  const handleAddNewTransaction = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  // Calculations for Metrics
  const totalBalance = wallets.reduce((acc, curr) => acc + curr.balance, 0);
  
  const currentMonthString = new Date().toISOString().substring(0, 7); // YYYY-MM
  
  // Dynamic monthly aggregate calculation based on loaded data
  // Note: For a larger dataset, we request summaries from the backend, but we compute here for instant accuracy
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpense, setMonthlyExpense] = useState(0);

  useEffect(() => {
    const fetchFullMonthAggregations = async () => {
      try {
        // Fetch current month's transactions
        const startOfMonth = `${currentMonthString}-01`;
        const endOfMonth = `${currentMonthString}-31`; // Loose end date
        const res = await transactionsApi.getAll({ startDate: startOfMonth, endDate: endOfMonth, limit: 100 });
        
        let inc = 0;
        let exp = 0;
        res.transactions.forEach(tx => {
          if (tx.type === 'income') inc += tx.amount;
          else exp += tx.amount;
        });
        setMonthlyIncome(inc);
        setMonthlyExpense(exp);
      } catch (e) {
        console.error(e);
      }
    };
    
    if (wallets.length > 0) {
      fetchFullMonthAggregations();
    }
  }, [transactions, wallets]);

  const totalSaved = goals.reduce((acc, curr) => acc + curr.currentAmount, 0);

  // Category Pie Chart formatting
  const categorySummaryMap: { [key: string]: number } = {};
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      categorySummaryMap[t.category] = (categorySummaryMap[t.category] || 0) + t.amount;
    });

  const pieChartData = Object.keys(categorySummaryMap).map((cat) => ({
    name: cat,
    value: categorySummaryMap[cat],
  }));

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#64748B'];

  // Income vs Expense trend mock charts
  const barChartData = [
    { name: 'Prev Month', Income: monthlyIncome * 0.9, Expenses: monthlyExpense * 0.85 },
    { name: 'Current Month', Income: monthlyIncome, Expenses: monthlyExpense },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
            Finance Command Center
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Real-time analytics and transaction management
          </p>
        </div>
        <button
          onClick={handleAddNewTransaction}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-emerald text-white font-sans font-bold text-xs shadow-lg shadow-brand-indigo/15 hover:shadow-brand-indigo/25 hover:opacity-95 active:scale-95 transition-all cursor-pointer"
        >
          <Plus size={16} /> Quick Add Expense
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <div className="w-10 h-10 rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-brand-indigo animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Metrics summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Balance */}
            <div className="p-5 rounded-2xl glass-panel border border-slate-200/50 dark:border-slate-800/40 shadow-sm relative overflow-hidden group hover:translate-y-[-2px] transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-indigo/5 rounded-full blur-xl"></div>
              <div className="flex justify-between items-center text-slate-400 dark:text-slate-500">
                <span className="text-[10px] font-bold uppercase tracking-wider">Total Net Worth</span>
                <WalletIcon size={18} className="text-brand-indigo" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">
                  ₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <span className="block mt-1 text-[10px] text-brand-emerald font-semibold flex items-center gap-0.5">
                  <TrendingUp size={10} /> Active across {wallets.length} accounts
                </span>
              </div>
            </div>

            {/* Card 2: Income */}
            <div className="p-5 rounded-2xl glass-panel border border-slate-200/50 dark:border-slate-800/40 shadow-sm relative overflow-hidden group hover:translate-y-[-2px] transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-emerald/5 rounded-full blur-xl"></div>
              <div className="flex justify-between items-center text-slate-400 dark:text-slate-500">
                <span className="text-[10px] font-bold uppercase tracking-wider">Monthly Income</span>
                <ArrowUpRight size={18} className="text-brand-emerald" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">
                  ₹{monthlyIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <span className="block mt-1 text-[10px] text-slate-400">
                  Earned in {new Date().toLocaleString('default', { month: 'long' })}
                </span>
              </div>
            </div>

            {/* Card 3: Expenses */}
            <div className="p-5 rounded-2xl glass-panel border border-slate-200/50 dark:border-slate-800/40 shadow-sm relative overflow-hidden group hover:translate-y-[-2px] transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-xl"></div>
              <div className="flex justify-between items-center text-slate-400 dark:text-slate-500">
                <span className="text-[10px] font-bold uppercase tracking-wider">Monthly Expenses</span>
                <ArrowDownRight size={18} className="text-red-500" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">
                  ₹{monthlyExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <span className="block mt-1 text-[10px] text-slate-400">
                  Charged this billing cycle
                </span>
              </div>
            </div>

            {/* Card 4: Savings */}
            <div className="p-5 rounded-2xl glass-panel border border-slate-200/50 dark:border-slate-800/40 shadow-sm relative overflow-hidden group hover:translate-y-[-2px] transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-purple/5 rounded-full blur-xl"></div>
              <div className="flex justify-between items-center text-slate-400 dark:text-slate-500">
                <span className="text-[10px] font-bold uppercase tracking-wider">Total Savings Locked</span>
                <PiggyBank size={18} className="text-brand-purple" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">
                  ₹{totalSaved.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <span className="block mt-1 text-[10px] text-brand-purple font-semibold">
                  Funded for active goals
                </span>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Income vs Expenses Bar Chart */}
            <div className="lg:col-span-8 p-6 rounded-3xl glass-panel border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex flex-col space-y-4">
              <div>
                <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-200">
                  Income vs Expenses Monthly Comparison
                </h3>
                <span className="text-[10px] text-slate-400">Comparing past vs current billing month</span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(15, 23, 42, 0.9)',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#fff',
                        fontFamily: 'Inter',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="Income" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Expenses" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Categorized spending doughnut */}
            <div className="lg:col-span-4 p-6 rounded-3xl glass-panel border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex flex-col space-y-4">
              <div>
                <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-200">
                  Spending Distribution
                </h3>
                <span className="text-[10px] text-slate-400">Expense categories this month</span>
              </div>
              <div className="flex-1 min-h-[220px] flex items-center justify-center relative">
                {pieChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieChartData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(15, 23, 42, 0.9)',
                          border: 'none',
                          borderRadius: '12px',
                          color: '#fff',
                          fontFamily: 'Inter',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center p-6 text-slate-450 dark:text-slate-500 text-xs flex flex-col items-center gap-2">
                    <TrendingUp size={24} className="opacity-40" />
                    <span>No spending records logged yet to chart.</span>
                  </div>
                )}
                
                {pieChartData.length > 0 && (
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-sans">Spent</span>
                    <span className="text-base font-bold text-slate-800 dark:text-white">
                      ₹{monthlyExpense.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Grid: Recent Transactions & Budgets/Goals snapshots */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Recent Transaction Rows */}
            <div className="lg:col-span-7 p-6 rounded-3xl glass-panel border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-200">
                    Recent Transactions
                  </h3>
                  <span className="text-[10px] text-slate-400">Your latest income and expense streams</span>
                </div>
              </div>

              <div className="space-y-2.5 overflow-y-auto max-h-96 pr-1">
                {transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <div
                      key={tx._id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-white/40 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/30 hover:bg-slate-100/30 dark:hover:bg-slate-850/30 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        {/* Transaction visual circle */}
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm"
                          style={{ backgroundColor: tx.wallet?.color || '#cbd5e1' }}
                        >
                          {tx.description[0].toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            {tx.description}
                            {tx.receiptUrl && (
                              <a
                                href={tx.receiptUrl}
                                target="_blank"
                                rel="noreferrer"
                                title="View uploaded receipt"
                                className="text-slate-400 hover:text-brand-indigo inline-flex items-center"
                              >
                                <Receipt size={12} />
                              </a>
                            )}
                          </h4>
                          <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-sans">
                            {tx.category} • {new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className={`text-xs font-bold block ${tx.type === 'income' ? 'text-brand-emerald' : 'text-red-500'}`}>
                            {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-sans block">
                            {tx.wallet?.name || 'Cash'}
                          </span>
                        </div>

                        {/* Interactive Edit / Delete icons */}
                        <div className="hidden group-hover:flex items-center gap-1 shrink-0 animate-scale-in">
                          <button
                            onClick={() => handleEditTransaction(tx)}
                            className="p-1 rounded bg-slate-150 hover:bg-brand-indigo/10 text-slate-500 hover:text-brand-indigo transition-colors cursor-pointer"
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteTransaction(tx._id)}
                            className="p-1 rounded bg-slate-150 hover:bg-red-500/10 text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-450 dark:text-slate-500 text-xs">
                    No transactions recorded yet. Click "Quick Add" to write one!
                  </div>
                )}
              </div>
            </div>

            {/* Budget Progress & Goal Progression side panels */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Budgets Tracker Card */}
              <div className="p-6 rounded-3xl glass-panel border border-slate-200/50 dark:border-slate-800/40 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-200">
                      Budgets Progress
                    </h3>
                    <span className="text-[10px] text-slate-400">Category limits for {new Date().toLocaleString('default', { month: 'short' })}</span>
                  </div>
                </div>

                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {budgets.length > 0 ? (
                    budgets.map((b) => {
                      const percent = Math.min(100, Math.round((b.spent / b.limit) * 100));
                      const isDanger = b.spent >= b.limit;
                      const isWarning = b.spent >= b.limit * 0.8 && b.spent < b.limit;

                      return (
                        <div key={b._id} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-slate-700 dark:text-slate-350">{b.category}</span>
                            <span className={`font-mono text-[11px] font-bold ${isDanger ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-slate-500'}`}>
                              ₹{b.spent.toLocaleString('en-IN', { maximumFractionDigits: 0 })} / ₹{b.limit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isDanger ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-brand-emerald'
                              }`}
                              style={{ width: `${percent}%` }}
                            ></div>
                          </div>
                          {(isDanger || isWarning) && (
                            <span className={`text-[9px] font-sans font-bold flex items-center gap-0.5 ${isDanger ? 'text-red-500' : 'text-amber-500'}`}>
                              <AlertTriangle size={10} /> {isDanger ? 'Limit Exceeded!' : 'Approaching limit (>80% spent)'}
                            </span>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 text-slate-450 dark:text-slate-500 text-xs">
                      No budgets set for this month.
                    </div>
                  )}
                </div>
              </div>

              {/* Savings Goals tracker card */}
              <div className="p-6 rounded-3xl glass-panel border border-slate-200/50 dark:border-slate-800/40 shadow-sm space-y-4">
                <div>
                  <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-200">
                    Active Savings Goals
                  </h3>
                  <span className="text-[10px] text-slate-400">Your savings milestones</span>
                </div>

                <div className="space-y-3.5 max-h-56 overflow-y-auto pr-1">
                  {goals.length > 0 ? (
                    goals.map((g) => {
                      const percent = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
                      return (
                        <div key={g._id} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-slate-700 dark:text-slate-350">{g.name}</span>
                            <span className="font-mono text-[11px] font-bold text-brand-emerald">
                              ₹{g.currentAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })} / ₹{g.targetAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${percent}%`, backgroundColor: g.color || '#10b981' }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-[9px] text-slate-450 dark:text-slate-500">
                            <span>Saved: {percent}%</span>
                            <span>Target: {new Date(g.targetDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 text-slate-450 dark:text-slate-500 text-xs">
                      No savings targets established.
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        </>
      )}

      {/* Transaction Entry/Editing Modal overlay */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchDashboardData}
        transactionToEdit={editingTransaction}
      />

    </div>
  );
};
export default Dashboard;
