'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { useKeyContext } from '@/contexts/KeyContext';
import { aleoService } from '@/lib/aleo';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { TransactionHistory } from '../components/TransactionHistory';
import { formatAmount } from '@/lib/utils';

// Mock transactions for now - will be replaced with actual data from Aleo
const mockTransactions = [
  {
    id: '1',
    type: 'deposit' as const,
    amount: 1000,
    timestamp: new Date('2024-03-15T10:00:00'),
    status: 'completed' as const,
    description: 'Initial deposit',
  },
  {
    id: '2',
    type: 'wager' as const,
    amount: -100,
    timestamp: new Date('2024-03-15T11:00:00'),
    status: 'completed' as const,
    description: 'Wager on match #123',
  },
  {
    id: '3',
    type: 'win' as const,
    amount: 200,
    timestamp: new Date('2024-03-15T12:00:00'),
    status: 'completed' as const,
    description: 'Won wager #123',
  },
];

export default function FundsPage() {
  const { selectedKey, getPrivateKey } = useKeyContext();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBalance = async () => {
    if (!selectedKey) {
      setBalance(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const privateKey = getPrivateKey(selectedKey.address);
      if (!privateKey) throw new Error('Private key not found');
      
      const newBalance = await aleoService.getBalance(privateKey);
      setBalance(newBalance);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load balance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBalance();
  }, [selectedKey, getPrivateKey]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!selectedKey) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <EmptyState
          title="No Key Selected"
          description="Please select a key to view your balance"
        />
      </Container>
    );
  }

  return (
    <ErrorBoundary>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Funds
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  Available Balance
                </Typography>
                <Typography variant="h3" component="div" sx={{ mb: 2 }}>
                  {balance !== null ? formatAmount(balance) : '0.00'}
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={loadBalance}
                  disabled={loading}
                >
                  Refresh Balance
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  Transaction History
                </Typography>
                <TransactionHistory transactions={mockTransactions} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </ErrorBoundary>
  );
} 