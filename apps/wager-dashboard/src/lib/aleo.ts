'use client';

import { Wager, WagerFormData } from './types';
import { WagerError } from './utils';

let loadingPromise: Promise<any> | null = null;
let loadedSDK: any = null;

class AleoService {
  private client: any = null;
  private recordProvider: any = null;
  private initialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  private async initialize() {
    if (this.initialized) return;

    try {
      // Load SDK dynamically
      if (!loadedSDK) {
        if (!loadingPromise) {
          loadingPromise = import('@provablehq/sdk').then(async (sdk) => {
            // Initialize thread pool
            await sdk.initThreadPool();
            loadedSDK = sdk;
            return sdk;
          });
        }
        const sdk = await loadingPromise;
        
        // Initialize the Aleo network client
        this.client = new sdk.AleoNetworkClient('https://api.explorer.provable.com/v1');
        
        // Initialize the record provider
        this.recordProvider = new sdk.NetworkRecordProvider(this.client);
      } else {
        // Initialize the Aleo network client
        this.client = new loadedSDK.AleoNetworkClient('https://api.explorer.provable.com/v1');
        
        // Initialize the record provider
        this.recordProvider = new loadedSDK.NetworkRecordProvider(this.client);
      }
      
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize Aleo service:', error);
      throw new WagerError('Failed to initialize Aleo service');
    }
  }

  private async ensureInitialized() {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  async getWagers(viewKey: any): Promise<Wager[]> {
    await this.ensureInitialized();

    try {
      // TODO: Implement actual wager fetching with Aleo
      return [];
    } catch (error) {
      console.error('Failed to fetch wagers:', error);
      throw new WagerError('Failed to fetch wagers');
    }
  }

  async createWager(privateKey: any, data: WagerFormData): Promise<void> {
    await this.ensureInitialized();

    try {
      // TODO: Implement actual wager creation with Aleo
    } catch (error) {
      console.error('Failed to create wager:', error);
      throw new WagerError('Failed to create wager');
    }
  }

  async updateWager(privateKey: any, wagerId: string, data: WagerFormData): Promise<void> {
    await this.ensureInitialized();

    try {
      // TODO: Implement actual wager update with Aleo
    } catch (error) {
      console.error('Failed to update wager:', error);
      throw new WagerError('Failed to update wager');
    }
  }

  async deleteWager(privateKey: any, wagerId: string): Promise<void> {
    await this.ensureInitialized();

    try {
      // TODO: Implement actual wager deletion with Aleo
    } catch (error) {
      console.error('Failed to delete wager:', error);
      throw new WagerError('Failed to delete wager');
    }
  }

  async getBalance(privateKey: any): Promise<number> {
    await this.ensureInitialized();

    try {
      // TODO: Implement actual balance fetching with Aleo
      return 0;
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      throw new WagerError('Failed to fetch balance');
    }
  }
}

// Create a single instance of the service
export const aleoService = new AleoService(); 