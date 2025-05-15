import { useState } from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Bet } from '@/lib/types/wager';
import { useWagerContext } from '@/contexts/WagerContext';
import { formatDistanceToNow } from 'date-fns';

interface WagerTableProps {
  showActive?: boolean;
  showSettled?: boolean;
}

export default function WagerTable({ showActive = true, showSettled = true }: WagerTableProps) {
  const { activeBets, settledBets, cancelWager, settleWager, error } = useWagerContext();
  const [selectedBet, setSelectedBet] = useState<Bet | null>(null);

  const getStatusColor = (status: Bet['status']) => {
    switch (status) {
      case 'PROPOSING':
        return 'warning';
      case 'MATCHED':
        return 'info';
      case 'SETTLED':
        return 'success';
      default:
        return 'default';
    }
  };

  const handleCancel = async (betId: string) => {
    await cancelWager(betId);
  };

  const handleSettle = async (betId: string) => {
    await settleWager(betId);
  };

  const displayBets = [
    ...(showActive ? activeBets : []),
    ...(showSettled ? settledBets : []),
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Event ID</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>To Win</TableCell>
              <TableCell>Vig</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayBets.map((bet) => (
              <TableRow key={bet.eventId}>
                <TableCell>{bet.eventId}</TableCell>
                <TableCell>
                  <Chip 
                    label={bet.status} 
                    color={getStatusColor(bet.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{bet.totalToWin - bet.totalVig}</TableCell>
                <TableCell>{bet.totalToWin}</TableCell>
                <TableCell>{bet.totalVig}</TableCell>
                <TableCell>
                  {formatDistanceToNow(bet.createdAt, { addSuffix: true })}
                </TableCell>
                <TableCell>
                  {bet.status === 'PROPOSING' && (
                    <Tooltip title="Cancel Wager">
                      <IconButton 
                        size="small" 
                        onClick={() => handleCancel(bet.eventId)}
                        color="error"
                      >
                        <CancelIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  {bet.status === 'MATCHED' && (
                    <Tooltip title="Settle Wager">
                      <IconButton 
                        size="small" 
                        onClick={() => handleSettle(bet.eventId)}
                        color="success"
                      >
                        <CheckCircleIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {displayBets.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No wagers found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
} 