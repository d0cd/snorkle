'use client';

import { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

export function WasmLoadingMessage() {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [message, setMessage] = useState('Loading Provable SDK...');

  useEffect(() => {
    // Simulate progress for better UX
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2,
      }}
    >
      <CircularProgress variant="determinate" value={loadingProgress} />
      <Typography variant="h6" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
} 