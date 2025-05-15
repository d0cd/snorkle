'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { Wager } from '@/lib/types';
import { useKeyContext } from '@/contexts/KeyContext';
import { aleoService } from '@/lib/aleo';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { WagerDetailsDialog } from '../components/WagerDetailsDialog';
import { formatAmount, formatDate } from '@/lib/utils';

export default function HistoryPage() {
  const { selectedKey, getViewKey } = useKeyContext();
  const [wagers, setWagers] = useState<Wager[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWager, setSelectedWager] = useState<Wager | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    const loadWagers = async () => {
      if (!selectedKey) {
        setWagers([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const viewKey = getViewKey(selectedKey.address);
        if (!viewKey) throw new Error('View key not found');
        const loadedWagers = await aleoService.getWagers(viewKey);
        setWagers(loadedWagers);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load wagers');
      } finally {
        setLoading(false);
      }
    };

    loadWagers();
  }, [selectedKey, getViewKey]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (wager: Wager) => {
    setSelectedWager(wager);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedWager(null);
  };

  const filteredWagers = wagers.filter((wager) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      wager.description.toLowerCase().includes(searchLower) ||
      wager.creator.toLowerCase().includes(searchLower) ||
      wager.status.toLowerCase().includes(searchLower)
    );
  });

  const paginatedWagers = filteredWagers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getStatusColor = (status: Wager['status']) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'active':
        return 'primary';
      default:
        return 'default';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      </Container>
    );
  }

  if (!selectedKey) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <EmptyState
          title="No Key Selected"
          description="Please select a key to view your wager history"
        />
      </Container>
    );
  }

  return (
    <ErrorBoundary>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Wager History
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search wagers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
        </Box>

        {filteredWagers.length === 0 ? (
          <EmptyState
            title="No Wagers Found"
            description="No wagers match your search criteria"
          />
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="right">Odds</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Updated</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedWagers.map((wager) => (
                  <TableRow key={wager.id}>
                    <TableCell>{wager.description}</TableCell>
                    <TableCell align="right">
                      {formatAmount(wager.amount)}
                    </TableCell>
                    <TableCell align="right">{wager.odds}</TableCell>
                    <TableCell>
                      <Chip
                        label={wager.status}
                        color={getStatusColor(wager.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(wager.createdAt)}</TableCell>
                    <TableCell>{formatDate(wager.updatedAt)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(wager)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredWagers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        )}

        <WagerDetailsDialog
          wager={selectedWager}
          open={detailsOpen}
          onClose={handleCloseDetails}
        />
      </Container>
    </ErrorBoundary>
  );
} 