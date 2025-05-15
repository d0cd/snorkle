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
    Alert
} from '@mui/material';
import {
    ContentCopy as CopyIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Verified as VerifiedIcon,
    Send as SendIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import { useKeyVault } from '../contexts/KeyVaultContext';
import { useNetwork } from '../contexts/NetworkContext';
import { useSnackbar } from 'notistack';
import { ManageKeysModal } from '../components/ManageKeysModal';

export const Account: React.FC = () => {
    const { keys, selectedKey, setSelectedKey } = useKeyVault();
    const { getApiUrl } = useNetwork();
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);
    const [showKeysModal, setShowKeysModal] = useState(false);
    const [message, setMessage] = useState('');
    const [signature, setSignature] = useState('');
    const [verificationResult, setVerificationResult] = useState<boolean | null>(null);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        enqueueSnackbar('Copied to clipboard', { variant: 'success' });
    };

    const handleSignMessage = async () => {
        if (!selectedKey) {
            enqueueSnackbar('Please select a key first', { variant: 'warning' });
            return;
        }

        if (!message) {
            enqueueSnackbar('Please enter a message to sign', { variant: 'warning' });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(getApiUrl('sign'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message,
                    privateKey: selectedKey.privateKey,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setSignature(data.signature);
            enqueueSnackbar('Message signed successfully', { variant: 'success' });
        } catch (error) {
            console.error('Error signing message:', error);
            enqueueSnackbar('Failed to sign message', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleVerifySignature = async () => {
        if (!selectedKey) {
            enqueueSnackbar('Please select a key first', { variant: 'warning' });
            return;
        }

        if (!message || !signature) {
            enqueueSnackbar('Please enter both message and signature', { variant: 'warning' });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(getApiUrl('verify'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message,
                    signature,
                    publicKey: selectedKey.address,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setVerificationResult(data.verified);
            enqueueSnackbar(
                data.verified ? 'Signature verified successfully' : 'Signature verification failed',
                { variant: data.verified ? 'success' : 'error' }
            );
        } catch (error) {
            console.error('Error verifying signature:', error);
            enqueueSnackbar('Failed to verify signature', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Account
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Manage your Aleo keys and sign/verify messages
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
                {/* Key Management Section */}
                <Grid xs={12} md={6}>
                    <Card variant="outlined">
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6">Key Management</Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={() => setShowKeysModal(true)}
                                >
                                    Manage Keys
                                </Button>
                            </Box>
                            {keys.length === 0 ? (
                                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                                    <Typography color="text.secondary">
                                        No keys found. Add a key to get started.
                                    </Typography>
                                </Paper>
                            ) : (
                                <Stack spacing={2}>
                                    {keys.map((key) => (
                                        <Paper
                                            key={key.id}
                                            variant="outlined"
                                            sx={{
                                                p: 2,
                                                bgcolor: selectedKey?.id === key.id ? 'action.selected' : 'background.paper'
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Box>
                                                    <Typography variant="subtitle1">{key.name}</Typography>
                                                    <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                                                        {key.address}
                                                    </Typography>
                                                </Box>
                                                <Box>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleCopy(key.address)}
                                                        title="Copy Address"
                                                    >
                                                        <CopyIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => setShowKeysModal(true)}
                                                        title="Edit Key"
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            </Box>
                                        </Paper>
                                    ))}
                                </Stack>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Message Signing Section */}
                <Grid xs={12} md={6}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Sign Message
                            </Typography>
                            <Stack spacing={2}>
                                <TextField
                                    label="Message"
                                    multiline
                                    rows={4}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    disabled={!selectedKey}
                                    fullWidth
                                />
                                <Button
                                    variant="contained"
                                    onClick={handleSignMessage}
                                    disabled={loading || !selectedKey || !message}
                                    startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                                >
                                    Sign Message
                                </Button>
                                {signature && (
                                    <Paper variant="outlined" sx={{ p: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom>
                                            Signature:
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontFamily: 'monospace',
                                                    wordBreak: 'break-all',
                                                    flex: 1
                                                }}
                                            >
                                                {signature}
                                            </Typography>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleCopy(signature)}
                                                title="Copy Signature"
                                            >
                                                <CopyIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </Paper>
                                )}
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Signature Verification Section */}
                <Grid xs={12}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Verify Signature
                            </Typography>
                            <Stack spacing={2}>
                                <TextField
                                    label="Message"
                                    multiline
                                    rows={4}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    disabled={!selectedKey}
                                    fullWidth
                                />
                                <TextField
                                    label="Signature"
                                    multiline
                                    rows={2}
                                    value={signature}
                                    onChange={(e) => setSignature(e.target.value)}
                                    disabled={!selectedKey}
                                    fullWidth
                                />
                                <Button
                                    variant="contained"
                                    onClick={handleVerifySignature}
                                    disabled={loading || !selectedKey || !message || !signature}
                                    startIcon={loading ? <CircularProgress size={20} /> : <VerifiedIcon />}
                                >
                                    Verify Signature
                                </Button>
                                {verificationResult !== null && (
                                    <Alert severity={verificationResult ? 'success' : 'error'}>
                                        {verificationResult
                                            ? 'Signature is valid'
                                            : 'Signature is invalid'}
                                    </Alert>
                                )}
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <ManageKeysModal
                open={showKeysModal}
                onClose={() => setShowKeysModal(false)}
            />
        </Box>
    );
}; 