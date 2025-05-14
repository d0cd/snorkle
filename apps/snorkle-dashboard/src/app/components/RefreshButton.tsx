'use client';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import RefreshIcon from '@mui/icons-material/Refresh';

interface RefreshButtonProps {
  onRefresh: () => void;
  isLoading?: boolean;
}

export function RefreshButton({ onRefresh, isLoading = false }: RefreshButtonProps) {
  return (
    <Button
      variant="outlined"
      startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
      onClick={onRefresh}
      disabled={isLoading}
      sx={{ minWidth: 120 }}
    >
      {isLoading ? 'Refreshing...' : 'Refresh'}
    </Button>
  );
} 