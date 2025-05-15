import React, { createContext, useContext, useState, useCallback } from 'react';
import { useSnackbar } from 'notistack';

interface Transaction {
    id: string;
    type: 'deploy' | 'execute' | 'transfer';
    status: 'pending' | 'confirmed' | 'failed';
    timestamp: number;
    details: Record<string, any>;
}

interface TransactionHistoryContextType {
    transactions: Transaction[];
    addTransaction: (transaction: Omit<Transaction, 'timestamp'>) => void;
    updateTransaction: (id: string, updates: Partial<Transaction>) => void;
    clearHistory: () => void;
}

const TransactionHistoryContext = createContext<TransactionHistoryContextType | undefined>(undefined);

export const TransactionHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const { enqueueSnackbar } = useSnackbar();

    const addTransaction = useCallback((transaction: Omit<Transaction, 'timestamp'>) => {
        setTransactions(prev => [{
            ...transaction,
            timestamp: Date.now()
        }, ...prev]);
        enqueueSnackbar('Transaction added to history', { variant: 'info' });
    }, [enqueueSnackbar]);

    const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
        setTransactions(prev => prev.map(tx => 
            tx.id === id ? { ...tx, ...updates } : tx
        ));
        enqueueSnackbar(`Transaction updated`, { variant: 'info' });
    }, [enqueueSnackbar]);

    const clearHistory = useCallback(() => {
        setTransactions([]);
        enqueueSnackbar('Transaction history cleared', { variant: 'info' });
    }, [enqueueSnackbar]);

    return (
        <TransactionHistoryContext.Provider value={{
            transactions,
            addTransaction,
            updateTransaction,
            clearHistory
        }}>
            {children}
        </TransactionHistoryContext.Provider>
    );
};

export const useTransactionHistory = () => {
    const context = useContext(TransactionHistoryContext);
    if (!context) {
        throw new Error('useTransactionHistory must be used within a TransactionHistoryProvider');
    }
    return context;
}; 