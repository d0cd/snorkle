'use client';

import React, { useState, useEffect } from 'react';
import { Box, Button, Container } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { WagerTable } from './components/WagerTable';
import { WagerForm } from './components/WagerForm';
import { Sidebar } from './components/Sidebar';
import { AddKeyDialog } from './components/AddKeyDialog';
import { Wager, WagerFormData } from '@/lib/types';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useKeyContext } from '@/contexts/KeyContext';
import { aleoService } from '@/lib/aleo';

export default function Home() {
  const {
    keys,
    selectedKey,
    loading: keyLoading,
    error: keyError,
    addKey,
    removeKey,
    selectKey,
    getPrivateKey,
    getViewKey,
  } = useKeyContext();

  const [wagers, setWagers] = useState<Wager[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isKeyDialogOpen, setIsKeyDialogOpen] = useState(false);
  const [selectedWager, setSelectedWager] = useState<Wager | undefined>();

  // Load wagers when selected key changes
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

  const handleCreateWager = async (data: WagerFormData) => {
    if (!selectedKey) {
      setError('No key selected');
      return;
    }

    try {
      setLoading(true);
      const privateKey = getPrivateKey(selectedKey.address);
      if (!privateKey) throw new Error('Private key not found');
      
      const newWager = await aleoService.createWager(privateKey, data);
      setWagers((prev) => [...prev, newWager]);
      setIsFormOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create wager');
    } finally {
      setLoading(false);
    }
  };

  const handleEditWager = (wager: Wager) => {
    setSelectedWager(wager);
    setIsFormOpen(true);
  };

  const handleDeleteWager = async (id: string) => {
    if (!selectedKey) {
      setError('No key selected');
      return;
    }

    try {
      setLoading(true);
      const privateKey = getPrivateKey(selectedKey.address);
      if (!privateKey) throw new Error('Private key not found');
      
      await aleoService.deleteWager(privateKey, id);
      setWagers((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete wager');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: Wager['status']) => {
    if (!selectedKey) {
      setError('No key selected');
      return;
    }

    try {
      setLoading(true);
      const privateKey = getPrivateKey(selectedKey.address);
      if (!privateKey) throw new Error('Private key not found');
      
      await aleoService.updateWagerStatus(privateKey, id, status);
      setWagers((prev) =>
        prev.map((w) =>
          w.id === id ? { ...w, status, updatedAt: new Date() } : w
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update wager status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <Box sx={{ display: 'flex' }}>
        <Sidebar
          keys={keys}
          selectedKey={selectedKey}
          balances={{}}
          onAddKey={() => setIsKeyDialogOpen(true)}
          onRemoveKey={removeKey}
          onSelectKey={selectKey}
        />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - 280px)` },
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setSelectedWager(undefined);
                  setIsFormOpen(true);
                }}
                disabled={!selectedKey}
              >
                New Wager
              </Button>
            </Box>
            <WagerTable
              wagers={wagers}
              loading={loading || keyLoading}
              error={error || keyError}
              onEdit={handleEditWager}
              onDelete={handleDeleteWager}
              onStatusChange={handleStatusChange}
            />
          </Container>
        </Box>
      </Box>
      <WagerForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedWager(undefined);
        }}
        onSubmit={handleCreateWager}
        wager={selectedWager}
        loading={loading}
      />
      <AddKeyDialog
        open={isKeyDialogOpen}
        onClose={() => setIsKeyDialogOpen(false)}
      />
    </ErrorBoundary>
  );
}
