export interface Key {
  address: string;
  privateKey: string;
  viewKey: string;
}

export interface Balance {
  address: string;
  amount: number;
  lastUpdated: Date;
}

export interface Wager {
  id: string;
  amount: number;
  odds: number;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  description: string;
  creator: string;
  participants: string[];
}

export interface WagerFormData {
  amount: number;
  odds: number;
  description: string;
}

export interface WagerContextType {
  wagers: Wager[];
  loading: boolean;
  error: string | null;
  createWager: (data: WagerFormData) => Promise<void>;
  updateWager: (id: string, data: Partial<Wager>) => Promise<void>;
  deleteWager: (id: string) => Promise<void>;
}

export interface KeyContextType {
  keys: Key[];
  selectedKey: Key | null;
  loading: boolean;
  error: string | null;
  addKey: (key: Key) => Promise<void>;
  removeKey: (address: string) => Promise<void>;
  selectKey: (address: string) => void;
}

export interface BalanceContextType {
  balances: Balance[];
  loading: boolean;
  error: string | null;
  refreshBalances: () => Promise<void>;
  getBalance: (address: string) => Balance | undefined;
} 