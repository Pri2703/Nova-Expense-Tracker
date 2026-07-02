import api from './api';

export interface Wallet {
  _id: string;
  name: string;
  type: 'cash' | 'bank' | 'credit_card' | 'investment' | 'other';
  balance: number;
  currency: string;
  color: string;
  createdAt: string;
}

export interface Transaction {
  _id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  wallet: {
    _id: string;
    name: string;
    type: string;
    color: string;
  };
  receiptUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface Budget {
  _id: string;
  category: string;
  limit: number;
  spent: number;
  period: string;
}

export interface Goal {
  _id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  color: string;
}

// WALLETS API
export const walletsApi = {
  getAll: async () => {
    const { data } = await api.get<Wallet[]>('/api/wallets');
    return data;
  },
  create: async (wallet: { name: string; type: string; balance: number; color?: string }) => {
    const { data } = await api.post<Wallet>('/api/wallets', wallet);
    return data;
  },
  update: async (id: string, wallet: Partial<Wallet>) => {
    const { data } = await api.put<Wallet>(`/api/wallets/${id}`, wallet);
    return data;
  },
  delete: async (id: string) => {
    const { data } = await api.delete<{ message: string }>(`/api/wallets/${id}`);
    return data;
  },
};

// TRANSACTIONS API
export interface GetTransactionsParams {
  search?: string;
  category?: string;
  walletId?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: string;
}

export interface PaginatedTransactions {
  transactions: Transaction[];
  page: number;
  pages: number;
  total: number;
}

export const transactionsApi = {
  getAll: async (params?: GetTransactionsParams) => {
    const { data } = await api.get<PaginatedTransactions>('/api/transactions', { params });
    return data;
  },
  create: async (formData: FormData) => {
    const { data } = await api.post<Transaction>('/api/transactions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },
  update: async (id: string, formData: FormData) => {
    const { data } = await api.put<Transaction>(`/api/transactions/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },
  delete: async (id: string) => {
    const { data } = await api.delete<{ message: string }>(`/api/transactions/${id}`);
    return data;
  },
};

// BUDGETS API
export const budgetsApi = {
  getAll: async (period?: string) => {
    const { data } = await api.get<Budget[]>('/api/budgets', { params: { period } });
    return data;
  },
  createOrUpdate: async (budget: { category: string; limit: number; period?: string }) => {
    const { data } = await api.post<Budget>('/api/budgets', budget);
    return data;
  },
  delete: async (id: string) => {
    const { data } = await api.delete<{ message: string }>(`/api/budgets/${id}`);
    return data;
  },
};

// SAVINGS GOALS API
export const goalsApi = {
  getAll: async () => {
    const { data } = await api.get<Goal[]>('/api/goals');
    return data;
  },
  create: async (goal: { name: string; targetAmount: number; currentAmount?: number; targetDate: string; color?: string }) => {
    const { data } = await api.post<Goal>('/api/goals', goal);
    return data;
  },
  update: async (id: string, goal: Partial<Goal>) => {
    const { data } = await api.put<Goal>(`/api/goals/${id}`, goal);
    return data;
  },
  fund: async (id: string, funding: { amount: number; walletId: string }) => {
    const { data } = await api.post<{ goal: Goal; wallet: Wallet; transaction: Transaction }>(
      `/api/goals/${id}/fund`,
      funding
    );
    return data;
  },
  delete: async (id: string) => {
    const { data } = await api.delete<{ message: string }>(`/api/goals/${id}`);
    return data;
  },
};
