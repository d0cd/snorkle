import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Stack,
    Button,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import { useTransactionHistory } from '../contexts/TransactionHistoryContext';
import { useSnackbar } from 'notistack';
import { TransactionInfo } from '../components/TransactionInfo';

export const History: React.FC = () => {
    const { transactions, clearHistory } = useTransactionHistory();
    const { enqueueSnackbar } = useSnackbar();

    const handleClearHistory = () => {
        if (window.confirm('Are you sure you want to clear all transaction history?')) {
            clearHistory();
            enqueueSnackbar('Transaction history cleared', { variant: 'success' });
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">
                    Transaction History
                </Typography>
                <Stack direction="row" spacing={1}>
                    <Tooltip title="Refresh">
                        <IconButton onClick={() => window.location.reload()}>
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Clear History">
                        <IconButton onClick={handleClearHistory} color="error">
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Box>

            {transactions.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                        No transactions found. Your transaction history will appear here.
                    </Typography>
                </Paper>
            ) : (
                <Stack spacing={2}>
                    {transactions.map((tx) => (
                        <TransactionInfo
                            key={tx.id}
                            id={tx.id}
                            type={tx.type}
                            status={tx.status}
                            timestamp={tx.timestamp}
                            details={tx.details}
                        />
                    ))}
                </Stack>
            )}
        </Box>
    );
}; 