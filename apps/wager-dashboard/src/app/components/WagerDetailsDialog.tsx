import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Chip,
  Divider,
} from '@mui/material';
import { Wager } from '@/lib/types';
import { formatAmount, formatDate } from '@/lib/utils';

interface WagerDetailsDialogProps {
  wager: Wager | null;
  open: boolean;
  onClose: () => void;
}

export const WagerDetailsDialog: React.FC<WagerDetailsDialogProps> = ({
  wager,
  open,
  onClose,
}) => {
  if (!wager) return null;

  const getStatusColor = (status: Wager['status']) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'active':
        return 'primary';
      default:
        return 'default';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Wager Details</Typography>
          <Chip
            label={wager.status}
            color={getStatusColor(wager.status)}
            size="small"
          />
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" color="textSecondary">
              Description
            </Typography>
            <Typography variant="body1" paragraph>
              {wager.description}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          <Grid item xs={6}>
            <Typography variant="subtitle1" color="textSecondary">
              Amount
            </Typography>
            <Typography variant="body1">
              {formatAmount(wager.amount)}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="subtitle1" color="textSecondary">
              Odds
            </Typography>
            <Typography variant="body1">{wager.odds}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          <Grid item xs={6}>
            <Typography variant="subtitle1" color="textSecondary">
              Created By
            </Typography>
            <Typography variant="body1">{wager.creator}</Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="subtitle1" color="textSecondary">
              Created At
            </Typography>
            <Typography variant="body1">
              {formatDate(wager.createdAt)}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" color="textSecondary">
              Participants
            </Typography>
            {wager.participants.length > 0 ? (
              wager.participants.map((participant, index) => (
                <Typography key={index} variant="body2">
                  {participant}
                </Typography>
              ))
            ) : (
              <Typography variant="body2" color="textSecondary">
                No participants yet
              </Typography>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}; 