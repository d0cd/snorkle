export interface Balance {
  available: number;
  wagered: number;
  won: number;
  lost: number;
}

export interface Transaction {
  type: 'DEPOSIT' | 'WITHDRAW' | 'WAGER' | 'WIN' | 'LOSS';
  amount: number;
  timestamp: Date;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  txId?: string;
}

export interface TransactionHistory {
  transactions: Transaction[];
  lastUpdated: Date;
} 