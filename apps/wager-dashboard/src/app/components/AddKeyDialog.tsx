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
import { useKeyContext } from '@/contexts/KeyContext';

interface AddKeyDialogProps {
  open: boolean;
  onClose: () => void;
}

export const AddKeyDialog: React.FC<AddKeyDialogProps> = ({
  open,
  onClose,
}) => {
  const { addKey, loading, error } = useKeyContext();
  const [privateKey, setPrivateKey] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLocalError(null);

    if (!privateKey.trim()) {
      setLocalError('Private key is required');
      return;
    }

    try {
      await addKey(privateKey.trim());
      onClose();
      setPrivateKey('');
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to add key');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Add New Key</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {(error || localError) && (
              <Alert severity="error" onClose={() => setLocalError(null)}>
                {error || localError}
              </Alert>
            )}
            <TextField
              label="Private Key"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              required
              fullWidth
              multiline
              rows={3}
              placeholder="Enter your Aleo private key"
              error={!!(error || localError)}
              helperText="Your private key will be stored securely in your browser's local storage"
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
            Add Key
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}; 