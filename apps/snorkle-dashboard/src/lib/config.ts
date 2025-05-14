export const ALEO_CONFIG = {
  network: process.env.NEXT_PUBLIC_ALEO_NETWORK || 'testnet',
  rpcUrl: process.env.NEXT_PUBLIC_ALEO_RPC_URL || 'https://api.explorer.aleo.org/v1',
  programs: {
    snorkleOracle: 'proto_snorkle_oracle_000.aleo',
    snorkleBet: 'proto_snorkle_bet_000.aleo',
  },
} as const; 