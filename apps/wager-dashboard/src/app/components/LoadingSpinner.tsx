'use client';

import { CircularProgress, Box } from '@mui/material';

interface LoadingSpinnerProps {
  size?: number;
  color?: 'primary' | 'secondary' | 'inherit';
}

export const LoadingSpinner = ({ size = 40, color = 'primary' }: LoadingSpinnerProps) => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="200px"
    >
      <CircularProgress size={size} color={color} />
    </Box>
  );
}; 