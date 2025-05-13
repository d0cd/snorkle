import { Box } from '@mui/material';
import { TransactionHistory } from '../../components/TransactionHistory';

export const History = () => {
    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4 }}>
            <TransactionHistory />
        </Box>
    );
}; 