export interface Wager {
  eventId: string;
  winnerIsHome: boolean;
  bet: number;
  toWin: number;
  vig: number;
  nonce: string;
}

export interface Bet {
  eventId: string;
  bettorOne: string;
  bettorTwo: string;
  wagerKeyOne: string;
  wagerKeyTwo: string;
  totalToWin: number;
  totalVig: number;
  facilitator: string;
  status: 'PROPOSING' | 'LOCKED' | 'SETTLED';
  winner?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WagerEntry {
  wager: Wager;
  betId: string;
} 