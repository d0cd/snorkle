import React, { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Stack,
    Alert,
    CircularProgress,
    Grid
} from '@mui/material';
import { useKeyVault } from '../contexts/KeyVaultContext';
import { useNetwork } from '../contexts/NetworkContext';
import { useTransactionHistory } from '../contexts/TransactionHistoryContext';
import { useSnackbar } from 'notistack';

export const Execute: React.FC = () => {
    const { selectedKey } = useKeyVault();
    const { network } = useNetwork();
    const { addTransaction } = useTransactionHistory();
    const { enqueueSnackbar } = useSnackbar();
    const [programId, setProgramId] = useState('');
    const [functionName, setFunctionName] = useState('');
    const [inputs, setInputs] = useState('');
    const [loading, setLoading] = useState(false);

    const handleExecute = async () => {
        if (!selectedKey) {
            enqueueSnackbar('Please select an account first', { variant: 'error' });
            return;
        }

        if (!programId || !functionName) {
            enqueueSnackbar('Please enter program ID and function name', { variant: 'error' });
            return;
        }

        setLoading(true);
        try {
            // TODO: Implement program execution using Aleo SDK
            const txId = 'dummy-tx-id'; // Replace with actual transaction ID
            addTransaction({
                id: txId,
                type: 'execute',
                status: 'pending',
                details: {
                    programId,
                    functionName,
                    inputs,
                    network
                }
            });
            enqueueSnackbar('Program execution initiated', { variant: 'success' });
            setInputs('');
        } catch (error) {
            enqueueSnackbar('Failed to execute program', { variant: 'error' });
        }
        setLoading(false);
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Execute Program
            </Typography>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Stack spacing={3}>
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Execute Aleo Program
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            Execute a function from a deployed Aleo program on the {network} network.
                        </Typography>
                    </Box>

                    {!selectedKey && (
                        <Alert severity="warning">
                            Please select an account first to execute programs.
                        </Alert>
                    )}

                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Program ID"
                                value={programId}
                                onChange={(e) => setProgramId(e.target.value)}
                                fullWidth
                                disabled={!selectedKey || loading}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Function Name"
                                value={functionName}
                                onChange={(e) => setFunctionName(e.target.value)}
                                fullWidth
                                disabled={!selectedKey || loading}
                            />
                        </Grid>
                    </Grid>

                    <TextField
                        label="Inputs (JSON)"
                        multiline
                        rows={4}
                        value={inputs}
                        onChange={(e) => setInputs(e.target.value)}
                        fullWidth
                        disabled={!selectedKey || loading}
                        sx={{
                            '& .MuiInputBase-input': {
                                fontFamily: 'monospace'
                            }
                        }}
                    />

                    <Button
                        variant="contained"
                        onClick={handleExecute}
                        disabled={!selectedKey || !programId || !functionName || loading}
                        startIcon={loading ? <CircularProgress size={20} /> : null}
                    >
                        {loading ? 'Executing...' : 'Execute Program'}
                    </Button>
                </Stack>
            </Paper>
        </Box>
    );
}; 