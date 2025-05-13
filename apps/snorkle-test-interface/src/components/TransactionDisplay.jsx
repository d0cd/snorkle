import React from 'react';
import {
    Box,
    Paper,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Chip,
    Grid,
    IconButton,
    Tooltip,
    useTheme
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useSnackbar } from 'notistack';

export const TransactionDisplay = ({ transaction }) => {
    const theme = useTheme();
    const { enqueueSnackbar } = useSnackbar();

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        enqueueSnackbar('Copied to clipboard!', { variant: 'success' });
    };

    const formatValue = (value) => {
        if (typeof value === 'object') {
            return JSON.stringify(value, null, 2);
        }
        return value?.toString() || 'N/A';
    };

    const renderField = (label, value, copyable = false) => (
        <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {label}
            </Typography>
            <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                p: 1,
                borderRadius: 1,
                wordBreak: 'break-all'
            }}>
                <Typography variant="body2" component="pre" sx={{ m: 0, flex: 1 }}>
                    {formatValue(value)}
                </Typography>
                {copyable && (
                    <Tooltip title="Copy to clipboard">
                        <IconButton size="small" onClick={() => copyToClipboard(value)}>
                            <ContentCopyIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>
        </Box>
    );

    if (!transaction) {
        return (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">No transaction data available</Typography>
            </Paper>
        );
    }

    return (
        <Paper sx={{ p: 3 }}>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                        Transaction Details
                    </Typography>
                    {renderField('Transaction ID', transaction.id, true)}
                    {renderField('Status', transaction.status)}
                </Grid>

                <Grid item xs={12}>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>Execution Details</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            {renderField('Program ID', transaction.execution?.programId, true)}
                            {renderField('Function Name', transaction.execution?.functionName)}
                            {renderField('Inputs', transaction.execution?.inputs)}
                            {renderField('Outputs', transaction.execution?.outputs)}
                            {renderField('Proof', transaction.execution?.proof, true)}
                        </AccordionDetails>
                    </Accordion>
                </Grid>

                <Grid item xs={12}>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>Fee Details</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            {renderField('Amount', transaction.fee?.amount)}
                            {renderField('Unit', transaction.fee?.unit)}
                        </AccordionDetails>
                    </Accordion>
                </Grid>

                {transaction.metadata && (
                    <Grid item xs={12}>
                        <Accordion>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography>Metadata</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                {Object.entries(transaction.metadata).map(([key, value]) => (
                                    <Box key={key} sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            {key}
                                        </Typography>
                                        <Typography variant="body2">
                                            {formatValue(value)}
                                        </Typography>
                                    </Box>
                                ))}
                            </AccordionDetails>
                        </Accordion>
                    </Grid>
                )}
            </Grid>
        </Paper>
    );
}; 