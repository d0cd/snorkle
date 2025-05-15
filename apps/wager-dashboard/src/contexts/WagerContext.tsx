import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Wager, Bet, WagerEntry } from '@/lib/types/wager';
import { useKeyContext } from './KeyContext';
import { useBalanceContext } from './BalanceContext';

interface WagerContextType {
  activeBets: Bet[];
  settledBets: Bet[];
  makeWager: (wager: Wager) => Promise<void>;
  cancelWager: (betId: string) => Promise<void>;
  settleWager: (betId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const WagerContext = createContext<WagerContextType | undefined>(undefined);

const STORAGE_KEY = 'wager-dashboard-wagers';

export function WagerProvider({ children }: { children: ReactNode }) {
  const [activeBets, setActiveBets] = useState<Bet[]>([]);
  const [settledBets, setSettledBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { activeKey } = useKeyContext();
  const { balance, withdraw } = useBalanceContext();

  // Load wagers from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const { activeBets: storedActive, settledBets: storedSettled } = 
          JSON.parse(stored);
        setActiveBets(storedActive.map((bet: any) => ({
          ...bet,
          createdAt: new Date(bet.createdAt),
          updatedAt: new Date(bet.updatedAt),
        })));
        setSettledBets(storedSettled.map((bet: any) => ({
          ...bet,
          createdAt: new Date(bet.createdAt),
          updatedAt: new Date(bet.updatedAt),
        })));
      }
    } catch (err) {
      setError('Failed to load wagers from storage');
      console.error('Failed to load wagers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save wagers to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      try {
        const store = {
          activeBets,
          settledBets,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
      } catch (err) {
        setError('Failed to save wagers to storage');
        console.error('Failed to save wagers:', err);
      }
    }
  }, [activeBets, settledBets, loading]);

  const makeWager = async (wager: Wager) => {
    if (!activeKey) {
      setError('No active key selected');
      return;
    }

    if (wager.bet > balance.available) {
      setError('Insufficient balance');
      return;
    }

    try {
      // TODO: Implement actual wager creation with Aleo
      const bet: Bet = {
        eventId: wager.eventId,
        bettorOne: activeKey.address,
        bettorTwo: '', // Will be filled when matched
        wagerKeyOne: '', // Will be generated
        wagerKeyTwo: '', // Will be generated
        totalToWin: wager.toWin,
        totalVig: wager.vig,
        facilitator: '', // Will be set
        status: 'PROPOSING',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setActiveBets(prev => [...prev, bet]);
      await withdraw(wager.bet);
      setError(null);
    } catch (err) {
      setError('Failed to create wager');
      console.error('Wager creation error:', err);
    }
  };

  const cancelWager = async (betId: string) => {
    const bet = activeBets.find(b => b.eventId === betId);
    if (!bet) {
      setError('Wager not found');
      return;
    }

    if (bet.status !== 'PROPOSING') {
      setError('Can only cancel wagers in proposing state');
      return;
    }

    try {
      // TODO: Implement actual wager cancellation with Aleo
      setActiveBets(prev => prev.filter(b => b.eventId !== betId));
      setError(null);
    } catch (err) {
      setError('Failed to cancel wager');
      console.error('Wager cancellation error:', err);
    }
  };

  const settleWager = async (betId: string) => {
    const bet = activeBets.find(b => b.eventId === betId);
    if (!bet) {
      setError('Wager not found');
      return;
    }

    if (bet.status === 'PROPOSING') {
      setError('Cannot settle wagers in proposing state');
      return;
    }

    try {
      // TODO: Implement actual wager settlement with Aleo
      const settledBet = { ...bet, status: 'SETTLED' as const };
      setActiveBets(prev => prev.filter(b => b.eventId !== betId));
      setSettledBets(prev => [...prev, settledBet]);
      setError(null);
    } catch (err) {
      setError('Failed to settle wager');
      console.error('Wager settlement error:', err);
    }
  };

  return (
    <WagerContext.Provider
      value={{
        activeBets,
        settledBets,
        makeWager,
        cancelWager,
        settleWager,
        loading,
        error,
      }}
    >
      {children}
    </WagerContext.Provider>
  );
}

export function useWagerContext() {
  const context = useContext(WagerContext);
  if (context === undefined) {
    throw new Error('useWagerContext must be used within a WagerProvider');
  }
  return context;
} 