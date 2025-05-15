import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Button,
    IconButton,
    Divider,
    Stack,
    Paper,
    TextField,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert
} from '@mui/material';
import {
    ContentCopy as CopyIcon,
    Add as AddIcon,
    Send as SendIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import { useKeyVault } from '../contexts/KeyVaultContext';
import { useNetwork } from '../contexts/NetworkContext';
import { useSnackbar } from 'notistack';

interface Record {
    id: string;
    owner: string;
    data: string;
    spent: boolean;
}

export const Record: React.FC = () => {
    const { selectedKey } = useKeyVault();
    const { getApiUrl } = useNetwork();
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState<Record[]>([]);
    const [showTransferDialog, setShowTransferDialog] = useState(false);
    const [transferAmount, setTransferAmount] = useState('');
    const [transferAddress, setTransferAddress] = useState('');
    const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        enqueueSnackbar('Copied to clipboard', { variant: 'success' });
    };

    const handleRefreshRecords = async () => {
        if (!selectedKey) {
            enqueueSnackbar('Please select a key first', { variant: 'warning' });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(getApiUrl(`account/${selectedKey.address}/records`));
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setRecords(data.records);
            enqueueSnackbar('Records updated', { variant: 'success' });
        } catch (error) {
            console.error('Error fetching records:', error);
            enqueueSnackbar('Failed to fetch records', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleTransfer = async () => {
        if (!selectedRecord || !transferAmount || !transferAddress) {
            enqueueSnackbar('Please fill in all fields', { variant: 'warning' });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(getApiUrl('transfer'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    recordId: selectedRecord.id,
                    amount: transferAmount,
                    recipient: transferAddress,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            enqueueSnackbar('Transfer initiated successfully', { variant: 'success' });
            setShowTransferDialog(false);
            handleRefreshRecords();
        } catch (error) {
            console.error('Error initiating transfer:', error);
            enqueueSnackbar('Failed to initiate transfer', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Records
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Manage your Aleo records and perform transfers
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
                {/* Records List */}
                <Grid xs={12}>
                    <Card variant="outlined">
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6">Your Records</Typography>
                                <Button
                                    variant="outlined"
                                    startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
                                    onClick={handleRefreshRecords}
                                    disabled={loading || !selectedKey}
                                >
                                    Refresh
                                </Button>
                            </Box>
                            {!selectedKey ? (
                                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                                    <Typography color="text.secondary">
                                        Select a key to view records
                                    </Typography>
                                </Paper>
                            ) : records.length === 0 ? (
                                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                                    <Typography color="text.secondary">
                                        No records found
                                    </Typography>
                                </Paper>
                            ) : (
                                <Stack spacing={2}>
                                    {records.map((record) => (
                                        <Paper
                                            key={record.id}
                                            variant="outlined"
                                            sx={{ p: 2 }}
                                        >
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Box>
                                                    <Typography variant="subtitle1">
                                                        Record ID: {record.id.slice(0, 8)}...
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Owner: {record.owner}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Status: {record.spent ? 'Spent' : 'Available'}
                                                    </Typography>
                                                </Box>
                                                <Box>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleCopy(record.id)}
                                                        title="Copy Record ID"
                                                    >
                                                        <CopyIcon fontSize="small" />
                                                    </IconButton>
                                                    {!record.spent && (
                                                        <Button
                                                            variant="contained"
                                                            size="small"
                                                            startIcon={<SendIcon />}
                                                            onClick={() => {
                                                                setSelectedRecord(record);
                                                                setShowTransferDialog(true);
                                                            }}
                                                        >
                                                            Transfer
                                                        </Button>
                                                    )}
                                                </Box>
                                            </Box>
                                        </Paper>
                                    ))}
                                </Stack>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Transfer Dialog */}
            <Dialog
                open={showTransferDialog}
                onClose={() => setShowTransferDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Transfer Record</DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 2 }}>
                        <TextField
                            label="Amount"
                            type="number"
                            value={transferAmount}
                            onChange={(e) => setTransferAmount(e.target.value)}
                            fullWidth
                        />
                        <TextField
                            label="Recipient Address"
                            value={transferAddress}
                            onChange={(e) => setTransferAddress(e.target.value)}
                            fullWidth
                        />
                        {selectedRecord && (
                            <Alert severity="info">
                                Transferring from record: {selectedRecord.id.slice(0, 8)}...
                            </Alert>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowTransferDialog(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleTransfer}
                        disabled={loading || !transferAmount || !transferAddress}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Transfer'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}; 