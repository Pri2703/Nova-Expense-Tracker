import React, { useEffect, useState } from 'react';
import { transactionsApi } from '../services/apiService';
import type { Transaction } from '../services/apiService';
import { TrendingUp, ArrowDownRight, Percent, Award } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

export const Analytics: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        // Fetch last 100 transactions to generate quality graphs
        const res = await transactionsApi.getAll({ limit: 100 });
        setTransactions(res.transactions);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Aggregation Calculations
  let totalIncome = 0;
  let totalExpense = 0;
  const categorySpentMap: { [key: string]: number } = {};
  const timelineMap: { [key: string]: { Date: string; Income: number; Expenses: number } } = {};

  transactions.forEach((t) => {
    // 1. Core aggregates
    if (t.type === 'income') {
      totalIncome += t.amount;
    } else {
      totalExpense += t.amount;
      categorySpentMap[t.category] = (categorySpentMap[t.category] || 0) + t.amount;
    }

    // 2. Timeline formatting (grouping by date)
    const dateFormatted = new Date(t.date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
    if (!timelineMap[dateFormatted]) {
      timelineMap[dateFormatted] = { Date: dateFormatted, Income: 0, Expenses: 0 };
    }
    if (t.type === 'income') {
      timelineMap[dateFormatted].Income += t.amount;
    } else {
      timelineMap[dateFormatted].Expenses += t.amount;
    }
  });

  // Convert aggregates to chart arrays
  const lineChartData = Object.values(timelineMap).reverse().slice(-10); // last 10 distinct days
  
  const barChartData = Object.keys(categorySpentMap)
    .map((cat) => ({
      Category: cat,
      Spent: categorySpentMap[cat],
    }))
    .sort((a, b) => b.Spent - a.Spent); // Sort descending

  const ratioChartData = [
    { name: 'Income', value: totalIncome },
    { name: 'Expenses', value: totalExpense },
  ];

  const RATIO_COLORS = ['#10B981', '#4F46E5'];

  // Advanced Indicators
  const cashFlowVolume = totalIncome + totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0;
  const highestCategory = barChartData.length > 0 ? barChartData[0].Category : 'None';
  const highestAmount = barChartData.length > 0 ? barChartData[0].Spent : 0;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
          Analytics & Trend Reports
        </h2>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Unlock granular visual insights into your cash distribution and savings ratios
        </p>
      </div>

      {loading ? (
        <div className="py-24 flex justify-center items-center">
          <div className="w-10 h-10 rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-brand-indigo animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Key Insights Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Volume */}
            <div className="p-5 rounded-2xl glass-panel border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-indigo/10 text-brand-indigo flex items-center justify-center shrink-0">
                <TrendingUp size={20} />
              </div>
              <div>
                <span className="block text-[10px] text-slate-450 dark:text-slate-550 uppercase font-bold tracking-wider">Turnover Volume</span>
                <span className="block text-lg font-display font-extrabold text-slate-800 dark:text-white mt-0.5">
                  ₹{cashFlowVolume.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>

            {/* Card 2: Savings Rate */}
            <div className="p-5 rounded-2xl glass-panel border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-emerald/10 text-brand-emerald flex items-center justify-center shrink-0">
                <Percent size={20} />
              </div>
              <div>
                <span className="block text-[10px] text-slate-450 dark:text-slate-550 uppercase font-bold tracking-wider">Savings Rate</span>
                <span className="block text-lg font-display font-extrabold text-slate-800 dark:text-white mt-0.5">
                  {savingsRate}%
                </span>
              </div>
            </div>

            {/* Card 3: Top Category */}
            <div className="p-5 rounded-2xl glass-panel border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                <Award size={20} />
              </div>
              <div>
                <span className="block text-[10px] text-slate-450 dark:text-slate-550 uppercase font-bold tracking-wider">Top Expense</span>
                <span className="block text-lg font-display font-extrabold text-slate-800 dark:text-white mt-0.5 truncate max-w-[150px]" title={highestCategory}>
                  {highestCategory}
                </span>
              </div>
            </div>

            {/* Card 4: Category Amount */}
            <div className="p-5 rounded-2xl glass-panel border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-purple/10 text-brand-purple flex items-center justify-center shrink-0">
                <ArrowDownRight size={20} />
              </div>
              <div>
                <span className="block text-[10px] text-slate-450 dark:text-slate-550 uppercase font-bold tracking-wider">Top Category Cost</span>
                <span className="block text-lg font-display font-extrabold text-slate-800 dark:text-white mt-0.5">
                  ₹{highestAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          </div>

          {/* Charts grid layouts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Timeline line chart */}
            <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 shadow-sm space-y-4">
              <div>
                <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-200">
                  Daily Cash Flow Progression
                </h3>
                <span className="text-[10px] text-slate-400">Timelines of income vs. expense transactions</span>
              </div>
              <div className="h-72">
                {lineChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800/50" />
                      <XAxis dataKey="Date" stroke="#94A3B8" fontSize={11} tickLine={false} />
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
                      <Line type="monotone" dataKey="Income" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="Expenses" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex justify-center items-center text-xs text-slate-400">
                    Insufficient data points to plot timeline.
                  </div>
                )}
              </div>
            </div>

            {/* Income vs Expense Pie Chart */}
            <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex flex-col space-y-4">
              <div>
                <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-200">
                  Income vs Expense Ratio
                </h3>
                <span className="text-[10px] text-slate-400">Total overall ratio comparison</span>
              </div>
              <div className="flex-1 min-h-[220px] flex items-center justify-center">
                {totalIncome > 0 || totalExpense > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ratioChartData}
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {ratioChartData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={RATIO_COLORS[index % RATIO_COLORS.length]} />
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
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center p-6 text-slate-400 text-xs">
                    No data points.
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Category costs column ranking */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 shadow-sm space-y-4">
            <div>
              <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-200">
                Expense Categorical Ranking
              </h3>
              <span className="text-[10px] text-slate-400">Comparing total expenditure values side-by-side</span>
            </div>
            <div className="h-64">
              {barChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} layout="vertical" margin={{ top: 10, right: 10, left: 30, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" className="dark:stroke-slate-800/50" />
                    <XAxis type="number" stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <YAxis dataKey="Category" type="category" stroke="#94A3B8" fontSize={11} tickLine={false} />
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
                    <Bar dataKey="Spent" fill="#4F46E5" radius={[0, 4, 4, 0]} barSize={15} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex justify-center items-center text-xs text-slate-400">
                  No categorical expenses recorded yet.
                </div>
              )}
            </div>
          </div>

        </>
      )}

    </div>
  );
};
export default Analytics;
