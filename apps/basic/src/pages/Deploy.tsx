import React, { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Stack,
    Alert,
    CircularProgress
} from '@mui/material';
import { useKeyVault } from '../contexts/KeyVaultContext';
import { useNetwork } from '../contexts/NetworkContext';
import { useTransactionHistory } from '../contexts/TransactionHistoryContext';
import { useSnackbar } from 'notistack';

export const Deploy: React.FC = () => {
    const { selectedKey } = useKeyVault();
    const { network } = useNetwork();
    const { addTransaction } = useTransactionHistory();
    const { enqueueSnackbar } = useSnackbar();
    const [program, setProgram] = useState('');
    const [loading, setLoading] = useState(false);

    const handleDeploy = async () => {
        if (!selectedKey) {
            enqueueSnackbar('Please select an account first', { variant: 'error' });
            return;
        }

        if (!program) {
            enqueueSnackbar('Please enter a program to deploy', { variant: 'error' });
            return;
        }

        setLoading(true);
        try {
            // TODO: Implement program deployment using Aleo SDK
            const txId = 'dummy-tx-id'; // Replace with actual transaction ID
            addTransaction({
                id: txId,
                type: 'deploy',
                status: 'pending',
                details: {
                    program,
                    network
                }
            });
            enqueueSnackbar('Program deployment initiated', { variant: 'success' });
            setProgram('');
        } catch (error) {
            enqueueSnackbar('Failed to deploy program', { variant: 'error' });
        }
        setLoading(false);
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Deploy Program
            </Typography>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Stack spacing={3}>
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Deploy Aleo Program
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            Enter your Aleo program code to deploy it to the {network} network.
                        </Typography>
                    </Box>

                    {!selectedKey && (
                        <Alert severity="warning">
                            Please select an account first to deploy programs.
                        </Alert>
                    )}

                    <TextField
                        label="Program Code"
                        multiline
                        rows={10}
                        value={program}
                        onChange={(e) => setProgram(e.target.value)}
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
                        onClick={handleDeploy}
                        disabled={!selectedKey || !program || loading}
                        startIcon={loading ? <CircularProgress size={20} /> : null}
                    >
                        {loading ? 'Deploying...' : 'Deploy Program'}
                    </Button>
                </Stack>
            </Paper>
        </Box>
    );
}; 