export interface KeyPair {
  privateKey: string;
  publicKey: string;
  name: string;
  address: string;
}

export interface KeyStore {
  keys: KeyPair[];
  activeKeyName: string | null;
} 