import { Box, Grid } from '@mui/material';
import { TransactionHistory } from '../../components/TransactionHistory';
import { TransactionInfo } from '../../components/TransactionInfo';
import { useState } from 'react';

export const History = () => {
    const [selectedTransactionId, setSelectedTransactionId] = useState(null);

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4 }}>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <TransactionHistory onSelectTransaction={(tx) => setSelectedTransactionId(tx.transactionId)} />
                </Grid>
                {selectedTransactionId && (
                    <Grid item xs={12}>
                        <TransactionInfo transactionId={selectedTransactionId} />
                    </Grid>
                )}
            </Grid>
        </Box>
    );
}; 