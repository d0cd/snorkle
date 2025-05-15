import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Balance, Transaction, TransactionHistory } from '@/lib/types/balance';

interface BalanceContextType {
  balance: Balance;
  transactions: Transaction[];
  deposit: (amount: number) => Promise<void>;
  withdraw: (amount: number) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

const STORAGE_KEY = 'wager-dashboard-balance';

export function BalanceProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState<Balance>({
    available: 0,
    wagered: 0,
    won: 0,
    lost: 0,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load balance and transactions from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const { balance: storedBalance, transactions: storedTransactions } = 
          JSON.parse(stored) as TransactionHistory;
        setBalance(storedBalance);
        setTransactions(storedTransactions.map(tx => ({
          ...tx,
          timestamp: new Date(tx.timestamp),
        })));
      }
    } catch (err) {
      setError('Failed to load balance from storage');
      console.error('Failed to load balance:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save balance and transactions to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      try {
        const store: TransactionHistory = {
          balance,
          transactions,
          lastUpdated: new Date(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
      } catch (err) {
        setError('Failed to save balance to storage');
        console.error('Failed to save balance:', err);
      }
    }
  }, [balance, transactions, loading]);

  const deposit = async (amount: number) => {
    if (amount <= 0) {
      setError('Deposit amount must be greater than 0');
      return;
    }

    try {
      // TODO: Implement actual deposit logic with Aleo
      const transaction: Transaction = {
        type: 'DEPOSIT',
        amount,
        timestamp: new Date(),
        status: 'PENDING',
      };

      setTransactions(prev => [...prev, transaction]);
      setBalance(prev => ({
        ...prev,
        available: prev.available + amount,
      }));

      // Simulate transaction completion
      setTimeout(() => {
        setTransactions(prev => 
          prev.map(tx => 
            tx === transaction 
              ? { ...tx, status: 'COMPLETED', txId: 'simulated-tx-id' }
              : tx
          )
        );
      }, 1000);

      setError(null);
    } catch (err) {
      setError('Failed to process deposit');
      console.error('Deposit error:', err);
    }
  };

  const withdraw = async (amount: number) => {
    if (amount <= 0) {
      setError('Withdrawal amount must be greater than 0');
      return;
    }

    if (amount > balance.available) {
      setError('Insufficient balance');
      return;
    }

    try {
      // TODO: Implement actual withdrawal logic with Aleo
      const transaction: Transaction = {
        type: 'WITHDRAW',
        amount,
        timestamp: new Date(),
        status: 'PENDING',
      };

      setTransactions(prev => [...prev, transaction]);
      setBalance(prev => ({
        ...prev,
        available: prev.available - amount,
      }));

      // Simulate transaction completion
      setTimeout(() => {
        setTransactions(prev => 
          prev.map(tx => 
            tx === transaction 
              ? { ...tx, status: 'COMPLETED', txId: 'simulated-tx-id' }
              : tx
          )
        );
      }, 1000);

      setError(null);
    } catch (err) {
      setError('Failed to process withdrawal');
      console.error('Withdrawal error:', err);
    }
  };

  return (
    <BalanceContext.Provider
      value={{
        balance,
        transactions,
        deposit,
        withdraw,
        loading,
        error,
      }}
    >
      {children}
    </BalanceContext.Provider>
  );
}

export function useBalanceContext() {
  const context = useContext(BalanceContext);
  if (context === undefined) {
    throw new Error('useBalanceContext must be used within a BalanceProvider');
  }
  return context;
} 