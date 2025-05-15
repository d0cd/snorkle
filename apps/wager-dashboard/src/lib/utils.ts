'use client';

import { format } from 'date-fns';

export class WagerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WagerError';
  }
}

export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (date: Date): string => {
  return format(date, 'MMM d, yyyy h:mm a');
};

export const validateWagerData = (data: { amount: number; odds: number; description: string }) => {
  if (data.amount <= 0) {
    throw new WagerError('Amount must be greater than 0');
  }
  if (data.odds <= 0) {
    throw new WagerError('Odds must be greater than 0');
  }
  if (!data.description.trim()) {
    throw new WagerError('Description is required');
  }
}; 