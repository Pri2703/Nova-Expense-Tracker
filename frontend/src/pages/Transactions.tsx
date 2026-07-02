import React, { useEffect, useState } from 'react';
import { transactionsApi, walletsApi } from '../services/apiService';
import type { Transaction, Wallet, GetTransactionsParams } from '../services/apiService';
import {
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  Trash2,
  Receipt,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { TransactionModal } from '../components/TransactionModal';

export const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  
  // Filtering & Pagination State
  const [filters, setFilters] = useState<GetTransactionsParams>({
    search: '',
    category: '',
    walletId: '',
    type: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 10,
    sortBy: 'date',
    order: 'desc',
  });

  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modal Control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

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

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await transactionsApi.getAll(filters);
      setTransactions(data.transactions);
      setTotalPages(data.pages);
      setTotalCount(data.total);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWallets = async () => {
    try {
      const data = await walletsApi.getAll();
      setWallets(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  useEffect(() => {
    fetchWallets();
  }, []);

  const handleFilterChange = (key: keyof GetTransactionsParams, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1, // Reset to page 1 on filter edits
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: '',
      walletId: '',
      type: '',
      startDate: '',
      endDate: '',
      page: 1,
      limit: 10,
      sortBy: 'date',
      order: 'desc',
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this transaction? Wallet balances and budgets will adjust.')) {
      try {
        await transactionsApi.delete(id);
        fetchTransactions();
      } catch (e) {
        alert('Failed to delete transaction');
      }
    }
  };

  const handleEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  // CSV Export Utility
  const handleExportCSV = () => {
    if (transactions.length === 0) return alert('No transactions to export');

    const headers = ['Description', 'Amount', 'Type', 'Category', 'Wallet', 'Date', 'Notes'];
    const rows = transactions.map((t) => [
      `"${t.description.replace(/"/g, '""')}"`,
      t.amount,
      t.type,
      t.category,
      `"${t.wallet?.name || 'Unknown'}"`,
      new Date(t.date).toLocaleDateString('en-IN'),
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nova_transactions_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
            Ledger & Transactions
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            A comprehensive history of all incoming and outgoing funds
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4.5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-350 bg-white dark:bg-slate-900 text-xs font-bold font-sans cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors"
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-1.5 px-4.5 py-3 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-emerald text-white font-sans font-bold text-xs shadow-md hover:opacity-95 active:scale-95 transition-all cursor-pointer"
          >
            <Plus size={14} /> Add Transaction
          </button>
        </div>
      </div>

      {/* Advanced Filter Toolbox */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-450" size={16} />
            <input
              type="text"
              placeholder="Search description..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800/55 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-indigo transition-colors"
            />
          </div>

          {/* Type Select */}
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800/55 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-indigo transition-colors"
          >
            <option value="">All Cash Flow Types</option>
            <option value="expense">Expense Only</option>
            <option value="income">Income Only</option>
          </select>

          {/* Category Select */}
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800/55 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-indigo transition-colors"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Wallet Select */}
          <select
            value={filters.walletId}
            onChange={(e) => handleFilterChange('walletId', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800/55 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-indigo transition-colors"
          >
            <option value="">All Accounts</option>
            {wallets.map((w) => (
              <option key={w._id} value={w._id}>
                {w.name}
              </option>
            ))}
          </select>

        </div>

        {/* Date Ranges and Reset controls */}
        <div className="flex flex-wrap gap-4 items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/40">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Filter size={12} /> Date Interval
            </span>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800/50 text-[11px] text-slate-800 dark:text-slate-200 focus:outline-none"
              />
              <span className="text-slate-400 text-[10px]">to</span>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800/50 text-[11px] text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>
          </div>
          
          <button
            onClick={handleResetFilters}
            className="text-[11px] font-sans font-bold text-slate-450 hover:text-red-500 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RefreshCw size={12} /> Clear Filter Adjustments
          </button>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 shadow-sm overflow-hidden">
        
        {loading ? (
          <div className="py-24 flex justify-center items-center">
            <div className="w-10 h-10 rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-brand-indigo animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800/60">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transaction</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Amount</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <tr
                      key={tx._id}
                      className="hover:bg-slate-50/30 dark:hover:bg-slate-850/20 transition-colors group"
                    >
                      {/* Name / Description */}
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-sans font-semibold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            {tx.description}
                            {tx.receiptUrl && (
                              <a
                                href={tx.receiptUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-slate-400 hover:text-brand-indigo inline-flex items-center"
                                title="Open upload receipt document"
                              >
                                <Receipt size={13} />
                              </a>
                            )}
                          </div>
                          {tx.notes && (
                            <span className="block text-[10px] text-slate-400 truncate max-w-[200px]">
                              {tx.notes}
                            </span>
                          )}
                        </div>
                      </td>
                      
                      {/* Category Badge */}
                      <td className="px-6 py-4">
                        <span className="inline-block px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-650 dark:text-slate-350">
                          {tx.category}
                        </span>
                      </td>
                      
                      {/* Date */}
                      <td className="px-6 py-4 text-xs text-slate-550 dark:text-slate-400 font-sans">
                        {new Date(tx.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      
                      {/* Account/Wallet tag */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-550 dark:text-slate-400">
                          <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: tx.wallet?.color || '#94a3b8' }}
                          ></div>
                          <span>{tx.wallet?.name || 'Cash Wallet'}</span>
                        </div>
                      </td>
                      
                      {/* Amount */}
                      <td className="px-6 py-4 text-right">
                        <span className={`text-xs font-bold ${tx.type === 'income' ? 'text-brand-emerald' : 'text-red-500'}`}>
                          {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(tx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-indigo hover:bg-brand-indigo/10 transition-all cursor-pointer"
                            title="Edit row details"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(tx._id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                            title="Delete transaction entry"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-450 dark:text-slate-500 text-xs">
                      No matching records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination bar */}
        {!loading && totalCount > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/20 dark:bg-slate-950/10 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              Showing {transactions.length} of {totalCount} records
            </span>
            <div className="flex items-center gap-3">
              <button
                disabled={filters.page === 1}
                onClick={() => handleFilterChange('page', (filters.page || 1) - 1)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <span>
                Page {filters.page} of {totalPages}
              </span>
              <button
                disabled={filters.page === totalPages}
                onClick={() => handleFilterChange('page', (filters.page || 1) + 1)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Transaction modal overlay for adding or updating transactions */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchTransactions}
        transactionToEdit={editingTransaction}
      />

    </div>
  );
};
export default Transactions;
