import { useState } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Typography,
    Tooltip,
    Paper,
    Stack,
    Divider
} from '@mui/material';
import {
    History as HistoryIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    ClearAll as ClearAllIcon
} from '@mui/icons-material';
import { useTransactionHistory } from '../contexts/TransactionHistoryContext';
import { CopyButton } from './CopyButton';

export const TransactionHistory = () => {
    const { transactions, clearHistory, deleteTransaction } = useTransactionHistory();
    const [selectedTx, setSelectedTx] = useState(null);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const handleViewDetails = (tx) => {
        setSelectedTx(tx);
    };

    const handleCloseDetails = () => {
        setSelectedTx(null);
    };

    return (
        <>
            <Card>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <HistoryIcon /> Transaction History
                        </Typography>
                        {transactions.length > 0 && (
                            <Tooltip title="Clear History">
                                <IconButton onClick={clearHistory} color="error">
                                    <ClearAllIcon />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>
                    {transactions.length === 0 ? (
                        <Typography color="text.secondary" align="center">
                            No transactions yet
                        </Typography>
                    ) : (
                        <List>
                            {transactions.map((tx) => (
                                <ListItem
                                    key={tx.id}
                                    secondaryAction={
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Tooltip title="View Details">
                                                <IconButton onClick={() => handleViewDetails(tx)}>
                                                    <VisibilityIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton onClick={() => deleteTransaction(tx.id)} color="error">
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    }
                                >
                                    <ListItemText
                                        primary={tx.type === 'deploy' ? 'Program Deployment' : 'Transaction Execution'}
                                        secondary={
                                            <>
                                                <Typography component="span" variant="body2" color="text.primary">
                                                    {tx.transactionId}
                                                </Typography>
                                                <br />
                                                {formatDate(tx.timestamp)}
                                            </>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </CardContent>
            </Card>

            <Dialog
                open={!!selectedTx}
                onClose={handleCloseDetails}
                maxWidth="md"
                fullWidth
            >
                {selectedTx && (
                    <>
                        <DialogTitle>
                            {selectedTx.type === 'deploy' ? 'Program Deployment Details' : 'Transaction Details'}
                        </DialogTitle>
                        <DialogContent>
                            <Stack spacing={2} sx={{ mt: 1 }}>
                                <Paper variant="outlined" sx={{ p: 2 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Transaction ID</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                                            {selectedTx.transactionId}
                                        </Typography>
                                        <CopyButton data={selectedTx.transactionId} />
                                    </Box>
                                </Paper>

                                <Paper variant="outlined" sx={{ p: 2 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Private Key Used</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                                            {selectedTx.privateKey}
                                        </Typography>
                                        <CopyButton data={selectedTx.privateKey} />
                                    </Box>
                                </Paper>

                                <Paper variant="outlined" sx={{ p: 2 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Timestamp</Typography>
                                    <Typography variant="body1">
                                        {formatDate(selectedTx.timestamp)}
                                    </Typography>
                                </Paper>

                                {selectedTx.type === 'deploy' && (
                                    <Paper variant="outlined" sx={{ p: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">Program Name</Typography>
                                        <Typography variant="body1">
                                            {selectedTx.programName}
                                        </Typography>
                                    </Paper>
                                )}

                                {selectedTx.type === 'execute' && (
                                    <Paper variant="outlined" sx={{ p: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">Function Name</Typography>
                                        <Typography variant="body1">
                                            {selectedTx.functionName}
                                        </Typography>
                                    </Paper>
                                )}

                                {selectedTx.additionalData && (
                                    <Paper variant="outlined" sx={{ p: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">Additional Data</Typography>
                                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                            {JSON.stringify(selectedTx.additionalData, null, 2)}
                                        </Typography>
                                    </Paper>
                                )}
                            </Stack>
                        </DialogContent>
                    </>
                )}
            </Dialog>
        </>
    );
}; 