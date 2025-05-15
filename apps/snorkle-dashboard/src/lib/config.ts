export const ALEO_CONFIG = {
  rpcUrl: process.env.NEXT_PUBLIC_ALEO_RPC_URL || 'https://api.explorer.aleo.org/v1',
  network: process.env.NEXT_PUBLIC_ALEO_NETWORK || 'mainnet',
  programs: {
    snorkleOracle: 'proto_snorkle_oracle_000.aleo',
    snorkleBet: 'proto_snorkle_bet_000.aleo',
  },
} as const; 