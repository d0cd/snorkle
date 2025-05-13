import React, { createContext, useContext, useState, useEffect } from "react";

const LOCAL_STORAGE_KEY = "snorkle_transaction_history";

const TransactionHistoryContext = createContext();

export const useTransactionHistory = () => useContext(TransactionHistoryContext);

export const TransactionHistoryProvider = ({ children }) => {
    const [transactions, setTransactions] = useState(() => {
        try {
            const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error("Error loading transaction history:", error);
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(transactions));
        } catch (error) {
            console.error("Error saving transaction history:", error);
        }
    }, [transactions]);

    const addTransaction = (transaction) => {
        const newTransaction = {
            ...transaction,
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
        };
        setTransactions(prev => [newTransaction, ...prev]);
    };

    const clearHistory = () => {
        setTransactions([]);
    };

    const deleteTransaction = (id) => {
        setTransactions(prev => prev.filter(tx => tx.id !== id));
    };

    return (
        <TransactionHistoryContext.Provider
            value={{
                transactions,
                addTransaction,
                clearHistory,
                deleteTransaction,
            }}
        >
            {children}
        </TransactionHistoryContext.Provider>
    );
}; 