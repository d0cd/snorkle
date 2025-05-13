import React, { createContext, useContext, useState, useEffect } from "react";

const TransactionHistoryContext = createContext();

export const useTransactionHistory = () => {
    const context = useContext(TransactionHistoryContext);
    if (!context) {
        throw new Error('useTransactionHistory must be used within a TransactionHistoryProvider');
    }
    return context;
};

export const TransactionHistoryProvider = ({ children }) => {
    const [transactions, setTransactions] = useState([]);

    // Load transactions from localStorage on mount
    useEffect(() => {
        const storedTransactions = localStorage.getItem('transactionHistory');
        if (storedTransactions) {
            setTransactions(JSON.parse(storedTransactions));
        }
    }, []);

    // Save transactions to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('transactionHistory', JSON.stringify(transactions));
    }, [transactions]);

    const addTransaction = (transaction) => {
        setTransactions(prev => {
            // Check if transaction already exists
            const exists = prev.some(t => t.id === transaction.id);
            if (exists) {
                return prev;
            }
            // Add new transaction at the beginning
            return [transaction, ...prev];
        });
    };

    const removeTransaction = (transactionId) => {
        setTransactions(prev => prev.filter(t => t.id !== transactionId));
    };

    const clearHistory = () => {
        setTransactions([]);
        localStorage.removeItem('transactionHistory');
    };

    const getTransactionById = (transactionId) => {
        return transactions.find(t => t.id === transactionId);
    };

    return (
        <TransactionHistoryContext.Provider
            value={{
                transactions,
                addTransaction,
                removeTransaction,
                clearHistory,
                getTransactionById
            }}
        >
            {children}
        </TransactionHistoryContext.Provider>
    );
}; 