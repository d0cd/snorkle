import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const NotFound: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh',
                textAlign: 'center',
                gap: 2
            }}
        >
            <Typography variant="h1" component="h1" gutterBottom>
                404
            </Typography>
            <Typography variant="h5" component="h2" gutterBottom>
                Page Not Found
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                The page you are looking for does not exist or has been moved.
            </Typography>
            <Button
                variant="contained"
                onClick={() => navigate('/')}
                sx={{ mt: 2 }}
            >
                Go to Home
            </Button>
        </Box>
    );
}; 