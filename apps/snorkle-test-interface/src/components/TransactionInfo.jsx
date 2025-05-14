import React, { useState, useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useNetwork } from '../contexts/NetworkContext';
import { useTransactionHistory } from '../contexts/TransactionHistoryContext';
import { TransactionDisplay } from './TransactionDisplay';
import { TransactionIdDropdown } from './TransactionIdDropdown';

export const TransactionInfo = () => {
    const [transactionId, setTransactionId] = useState('');
    const [transaction, setTransaction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { endpointUrl, networkString } = useNetwork();
    const { addTransaction } = useTransactionHistory();

    const fetchTransaction = async (id) => {
        if (!id) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const url = `/api/${networkString}/transaction/${id}`;
            const response = await axios.get(url);
            const transactionData = response.data;
            
            setTransaction(transactionData);
            addTransaction(transactionData);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to fetch transaction');
            setTransaction(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (transactionId) {
            fetchTransaction(transactionId);
        }
    }, [transactionId, networkString]);

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 3 }}>
                <TransactionIdDropdown
                    value={transactionId}
                    onChange={setTransactionId}
                    error={!!error}
                    helperText={error}
                />
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TransactionDisplay transaction={transaction} />
            )}
        </Box>
    );
}; 