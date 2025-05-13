import React from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { useTransactionHistory } from '../contexts/TransactionHistoryContext';

export const TransactionIdDropdown = ({ value, onChange, label = 'Transaction ID', error, helperText }) => {
    const { transactions } = useTransactionHistory();

    return (
        <Autocomplete
            value={value}
            onChange={(event, newValue) => onChange(newValue)}
            options={transactions.map(tx => tx.id)}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={label}
                    error={error}
                    helperText={helperText}
                    fullWidth
                />
            )}
            freeSolo
            disableClearable
            renderOption={(props, option) => (
                <li {...props}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>{option}</span>
                        <span style={{ fontSize: '0.8em', color: '#666' }}>
                            {transactions.find(tx => tx.id === option)?.execution?.functionName || 'Unknown'}
                        </span>
                    </div>
                </li>
            )}
        />
    );
}; 