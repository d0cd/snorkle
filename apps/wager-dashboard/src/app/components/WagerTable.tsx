'use client';

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  Box,
  IconButton,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { Wager } from '@/lib/types';
import { formatAmount, formatDate } from '@/lib/utils';
import { LoadingSpinner } from './LoadingSpinner';
import { EmptyState } from './EmptyState';
import { ErrorBoundary } from './ErrorBoundary';

interface WagerTableProps {
  wagers: Wager[];
  loading: boolean;
  error: string | null;
  onEdit: (wager: Wager) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Wager['status']) => void;
}

type SortField = 'amount' | 'odds' | 'createdAt' | 'status';
type SortOrder = 'asc' | 'desc';

export const WagerTable: React.FC<WagerTableProps> = ({
  wagers,
  loading,
  error,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedWagers = [...wagers].sort((a, b) => {
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    switch (sortField) {
      case 'amount':
        return (a.amount - b.amount) * multiplier;
      case 'odds':
        return (a.odds - b.odds) * multiplier;
      case 'createdAt':
        return (a.createdAt.getTime() - b.createdAt.getTime()) * multiplier;
      case 'status':
        return a.status.localeCompare(b.status) * multiplier;
      default:
        return 0;
    }
  });

  const getStatusColor = (status: Wager['status']) => {
    switch (status) {
      case 'active':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <EmptyState
        title="Error Loading Wagers"
        description={error}
        actionLabel="Retry"
        onAction={() => window.location.reload()}
      />
    );
  }

  if (wagers.length === 0) {
    return (
      <EmptyState
        title="No Wagers Found"
        description="Create your first wager to get started"
        actionLabel="Create Wager"
        onAction={() => onEdit({} as Wager)}
      />
    );
  }

  return (
    <ErrorBoundary>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'amount'}
                  direction={sortField === 'amount' ? sortOrder : 'asc'}
                  onClick={() => handleSort('amount')}
                >
                  Amount
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'odds'}
                  direction={sortField === 'odds' ? sortOrder : 'asc'}
                  onClick={() => handleSort('odds')}
                >
                  Odds
                </TableSortLabel>
              </TableCell>
              <TableCell>Description</TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'status'}
                  direction={sortField === 'status' ? sortOrder : 'asc'}
                  onClick={() => handleSort('status')}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'createdAt'}
                  direction={sortField === 'createdAt' ? sortOrder : 'asc'}
                  onClick={() => handleSort('createdAt')}
                >
                  Created
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedWagers.map((wager) => (
              <TableRow key={wager.id}>
                <TableCell>{formatAmount(wager.amount)}</TableCell>
                <TableCell>{wager.odds.toFixed(2)}</TableCell>
                <TableCell>{wager.description}</TableCell>
                <TableCell>
                  <Chip
                    label={wager.status}
                    color={getStatusColor(wager.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{formatDate(wager.createdAt)}</TableCell>
                <TableCell align="right">
                  <Box display="flex" justifyContent="flex-end" gap={1}>
                    {wager.status === 'active' && (
                      <>
                        <Tooltip title="Complete">
                          <IconButton
                            size="small"
                            onClick={() => onStatusChange(wager.id, 'completed')}
                          >
                            <CheckCircleIcon color="success" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancel">
                          <IconButton
                            size="small"
                            onClick={() => onStatusChange(wager.id, 'cancelled')}
                          >
                            <CancelIcon color="error" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => onEdit(wager)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => onDelete(wager.id)}
                      >
                        <DeleteIcon color="error" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </ErrorBoundary>
  );
}; 