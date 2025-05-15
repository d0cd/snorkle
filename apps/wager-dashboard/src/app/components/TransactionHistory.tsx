'use client';

import React, { useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { formatAmount, formatDate } from '@/lib/utils';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'wager' | 'win' | 'loss';
  amount: number;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
  description: string;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
  loading?: boolean;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  loading = false,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getTransactionTypeColor = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
      case 'win':
        return 'success';
      case 'withdrawal':
      case 'loss':
        return 'error';
      case 'wager':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const paginatedTransactions = transactions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (transactions.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="textSecondary">
          No transactions found
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Type</TableCell>
            <TableCell>Description</TableCell>
            <TableCell align="right">Amount</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedTransactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>
                <Chip
                  label={transaction.type}
                  color={getTransactionTypeColor(transaction.type)}
                  size="small"
                />
              </TableCell>
              <TableCell>{transaction.description}</TableCell>
              <TableCell align="right">
                {formatAmount(transaction.amount)}
              </TableCell>
              <TableCell>
                <Chip
                  label={transaction.status}
                  color={getStatusColor(transaction.status)}
                  size="small"
                />
              </TableCell>
              <TableCell>{formatDate(transaction.timestamp)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={transactions.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </TableContainer>
  );
}; 