export interface ClientEarning {
  id: string;
  name: string;
  totalEarnings: number;
  activeContracts: number;
  lastPaymentDate: string; // ISO Date string
}

export interface Transaction {
  id: string;
  type: 'Contract Payment' | 'Withdrawal' | 'Subscription Fee';
  clientName: string | null;
  amount: number;
  date: string; // ISO Date string
  status: 'Completed' | 'Pending' | 'Failed';
}

export interface IncomeStats {
  currentBalance: number;
  totalEarned: number;
  pendingPayout: number;
  lastMonthIncome: number;
}

export const mockIncomeStats: IncomeStats = {
  currentBalance: 1250.75,
  totalEarned: 15480.50,
  pendingPayout: 350.00,
  lastMonthIncome: 2450.00,
};

export const mockClientEarnings: ClientEarning[] = [
  {
    id: 'cl1',
    name: 'Alex Johnson',
    totalEarnings: 3600.00,
    activeContracts: 2,
    lastPaymentDate: '2025-09-20T10:00:00Z',
  },
  {
    id: 'cl2',
    name: 'Sarah Lee',
    totalEarnings: 5800.00,
    activeContracts: 1,
    lastPaymentDate: '2025-09-27T14:30:00Z',
  },
  {
    id: 'cl3',
    name: 'Mark Davis',
    totalEarnings: 2100.00,
    activeContracts: 1,
    lastPaymentDate: '2025-08-15T09:00:00Z',
  },
];

export const mockTransactions: Transaction[] = [
  {
    id: 'tx1',
    type: 'Contract Payment',
    clientName: 'Sarah Lee',
    amount: 500.00,
    date: '2025-09-27T14:30:00Z',
    status: 'Completed',
  },
  {
    id: 'tx2',
    type: 'Contract Payment',
    clientName: 'Alex Johnson',
    amount: 250.00,
    date: '2025-09-20T10:00:00Z',
    status: 'Completed',
  },
  {
    id: 'tx3',
    type: 'Withdrawal',
    clientName: null,
    amount: -1000.00,
    date: '2025-09-15T12:00:00Z',
    status: 'Pending',
  },
  {
    id: 'tx4',
    type: 'Contract Payment',
    clientName: 'David Kim',
    amount: 350.00,
    date: '2025-09-01T09:00:00Z',
    status: 'Completed',
  },
];
