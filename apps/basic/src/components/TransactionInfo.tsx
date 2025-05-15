import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    IconButton,
    Collapse
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    ContentCopy as CopyIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

interface TransactionInfoProps {
    id: string;
    type: 'deploy' | 'execute' | 'transfer';
    status: 'pending' | 'confirmed' | 'failed';
    timestamp: number;
    details: any;
}

export const TransactionInfo: React.FC<TransactionInfoProps> = ({
    id,
    type,
    status,
    timestamp,
    details
}) => {
    const [expanded, setExpanded] = React.useState(false);
    const { enqueueSnackbar } = useSnackbar();

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        enqueueSnackbar('Copied to clipboard', { variant: 'success' });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'success';
            case 'failed':
                return 'error';
            default:
                return 'warning';
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString();
    };

    return (
        <Card sx={{ mb: 2 }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" component="div">
                        {type.charAt(0).toUpperCase() + type.slice(1)} Transaction
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                            label={status}
                            color={getStatusColor(status) as any}
                            size="small"
                        />
                        <IconButton
                            size="small"
                            onClick={() => setExpanded(!expanded)}
                        >
                            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                    </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {formatDate(timestamp)}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        ID:
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {id}
                    </Typography>
                    <IconButton
                        size="small"
                        onClick={() => handleCopy(id)}
                    >
                        <CopyIcon fontSize="small" />
                    </IconButton>
                </Box>

                <Collapse in={expanded}>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Details:
                        </Typography>
                        <Box
                            component="pre"
                            sx={{
                                p: 1,
                                bgcolor: 'background.paper',
                                borderRadius: 1,
                                overflow: 'auto',
                                maxHeight: 200
                            }}
                        >
                            {JSON.stringify(details, null, 2)}
                        </Box>
                    </Box>
                </Collapse>
            </CardContent>
        </Card>
    );
}; 