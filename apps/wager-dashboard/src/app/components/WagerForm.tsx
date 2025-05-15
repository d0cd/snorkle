'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Wager, WagerFormData } from '@/lib/types';
import { validateWagerData, WagerError } from '@/lib/utils';

interface WagerFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: WagerFormData) => Promise<void>;
  wager?: Wager;
  loading?: boolean;
}

export const WagerForm: React.FC<WagerFormProps> = ({
  open,
  onClose,
  onSubmit,
  wager,
  loading = false,
}) => {
  const [formData, setFormData] = useState<WagerFormData>({
    amount: wager?.amount || 0,
    odds: wager?.odds || 0,
    description: wager?.description || '',
  });

  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof WagerFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'description' 
      ? event.target.value 
      : parseFloat(event.target.value);
    
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      validateWagerData(formData);
      await onSubmit(formData);
      onClose();
    } catch (err) {
      if (err instanceof WagerError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {wager ? 'Edit Wager' : 'Create New Wager'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
            <TextField
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={handleChange('amount')}
              required
              fullWidth
              inputProps={{ min: 0, step: 0.01 }}
              error={!!error && error.includes('Amount')}
            />
            <TextField
              label="Odds"
              type="number"
              value={formData.odds}
              onChange={handleChange('odds')}
              required
              fullWidth
              inputProps={{ min: 0, step: 0.01 }}
              error={!!error && error.includes('Odds')}
              helperText="Enter the odds as a decimal (e.g., 2.5 for 2.5:1)"
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={handleChange('description')}
              required
              fullWidth
              multiline
              rows={3}
              error={!!error && error.includes('Description')}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {wager ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}; 