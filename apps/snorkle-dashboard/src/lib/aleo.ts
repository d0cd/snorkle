import { Program, Mapping, MappingEntry } from './types';
import { ALEO_CONFIG } from './config';
import { AleoNetworkClient, NetworkRecordProvider } from '@aleohq/sdk';

// Initialize Aleo client
const aleoClient = new AleoNetworkClient(ALEO_CONFIG.rpcUrl);
const recordProvider = new NetworkRecordProvider(aleoClient);

// Mock data for development
const mockPrograms: Program[] = [
  {
    id: 'proto_snorkle_oracle_000',
    name: 'Snorkle Oracle',
    mappings: [
      { id: 'data', name: 'Data Mapping', keyType: 'field', valueType: 'Data' },
      { id: 'entries', name: 'Entries Mapping', keyType: 'u128', valueType: 'any' },
      { id: 'length', name: 'Length Mapping', keyType: 'u8', valueType: 'u128' },
    ],
  },
  {
    id: 'proto_snorkle_bet_000',
    name: 'Snorkle Bet',
    mappings: [
      { id: 'data', name: 'Data Mapping', keyType: 'field', valueType: 'Data' },
      { id: 'entries', name: 'Entries Mapping', keyType: 'u128', valueType: 'any' },
      { id: 'length', name: 'Length Mapping', keyType: 'u8', valueType: 'u128' },
    ],
  },
];

// Helper function to make API calls to Aleo RPC
async function aleoRpcCall(endpoint: string, params: any = {}) {
  try {
    const response = await fetch(`${ALEO_CONFIG.rpcUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Aleo RPC call failed:', error);
    throw error;
  }
}

export async function fetchPrograms(): Promise<Program[]> {
  try {
    // TODO: Replace with actual program fetching using Aleo SDK
    // For now, return mock data
    return mockPrograms;
  } catch (error) {
    console.error('Error fetching programs:', error);
    throw new Error('Failed to fetch programs');
  }
}

export async function fetchMappingEntries(
  programId: string,
  mappingId: string,
  pageSize: number,
  currentPage: number
): Promise<MappingEntry[]> {
  try {
    // Calculate start and end indices for pagination
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    // Get the program's ABI
    const program = await aleoClient.getProgram(programId);
    if (!program) {
      throw new Error(`Program ${programId} not found`);
    }

    // Get mapping entries
    const entries: MappingEntry[] = [];
    for (let i = startIndex; i < endIndex; i++) {
      try {
        const value = await aleoClient.getMappingValue(programId, mappingId, i.toString());
        if (value) {
          entries.push({
            key: i.toString(),
            value: parseAleoValue(value, 'field'), // Adjust type based on mapping definition
          });
        }
      } catch (error) {
        console.warn(`Failed to fetch entry at index ${i}:`, error);
        continue;
      }
    }

    return entries;
  } catch (error) {
    console.error('Error fetching mapping entries:', error);
    throw new Error('Failed to fetch mapping entries');
  }
}

export async function getMappingLength(
  programId: string,
  mappingId: string
): Promise<number> {
  try {
    // Get the program's ABI
    const program = await aleoClient.getProgram(programId);
    if (!program) {
      throw new Error(`Program ${programId} not found`);
    }

    // Try to get the length mapping value
    const lengthValue = await aleoClient.getMappingValue(programId, 'length', '0');
    if (lengthValue) {
      return Number(parseAleoValue(lengthValue, 'u128'));
    }

    // If length mapping is not available, try to count entries
    let count = 0;
    let hasMore = true;
    while (hasMore) {
      try {
        const value = await aleoClient.getMappingValue(programId, mappingId, count.toString());
        if (value) {
          count++;
        } else {
          hasMore = false;
        }
      } catch (error) {
        hasMore = false;
      }
    }
    return count;
  } catch (error) {
    console.error('Error getting mapping length:', error);
    throw new Error('Failed to get mapping length');
  }
}

// Helper function to format Aleo values
export function formatAleoValue(value: any): string {
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}

// Helper function to parse Aleo values
export function parseAleoValue(value: string, type: string): any {
  try {
    switch (type) {
      case 'u8':
      case 'u16':
      case 'u32':
      case 'u64':
      case 'u128':
        return BigInt(value);
      case 'i8':
      case 'i16':
      case 'i32':
      case 'i64':
      case 'i128':
        return BigInt(value);
      case 'field':
        return value;
      case 'boolean':
        return value === 'true';
      default:
        return value;
    }
  } catch (error) {
    console.error('Error parsing Aleo value:', error);
    return value;
  }
}

// Helper function to get program ABI
export async function getProgramAbi(programId: string): Promise<any> {
  try {
    const program = await aleoClient.getProgram(programId);
    return program?.abi;
  } catch (error) {
    console.error('Error getting program ABI:', error);
    throw new Error('Failed to get program ABI');
  }
}

// Helper function to get mapping value
export async function getMappingValue(
  programId: string,
  mappingId: string,
  key: string
): Promise<any> {
  try {
    return await aleoClient.getMappingValue(programId, mappingId, key);
  } catch (error) {
    console.error('Error getting mapping value:', error);
    throw new Error('Failed to get mapping value');
  }
}

// Interface for attestation verification result
interface AttestationVerificationResult {
  isValid: boolean;
  oracleId?: string;
  registrationTimestamp?: number;
  validUntil?: number;
  error?: string;
}

/**
 * Verifies an attestation for a specific oracle
 * @param programId - The program ID to check against
 * @param oracleAddress - The oracle address to verify
 * @param attestationHash - The attestation hash to verify
 * @param network - The network to check on (mainnet/testnet/canary)
 * @returns Promise<AttestationVerificationResult>
 */
export async function verifyAttestation(
  programId: string,
  oracleAddress: string,
  attestationHash: string,
  network: string
): Promise<AttestationVerificationResult> {
  try {
    // Get the RPC URL based on the network
    const rpcUrl = network === 'mainnet' 
      ? 'https://api.explorer.provable.com/v1'
      : network === 'testnet'
      ? 'https://api.explorer.provable.com/v1'
      : 'http://localhost:3030';

    // Fetch oracle data directly using the address
    const oracleRes = await fetch(`${rpcUrl}/${network}/program/${programId}/mapping/registered_oracles/${oracleAddress}`);
    if (!oracleRes.ok) {
      return { isValid: false, error: 'Oracle not found' };
    }

    const oracleData = await oracleRes.json();
    const data = oracleData.value || oracleData;

    // Check if attestation hash matches
    if (data.attestation_hash === attestationHash) {
      return {
        isValid: true,
        oracleId: oracleAddress,
        registrationTimestamp: parseInt(data.registration_timestamp),
        validUntil: parseInt(data.registration_timestamp) + 1000
      };
    }

    return { isValid: false, error: 'Attestation hash does not match' };
  } catch (error) {
    return { isValid: false, error: 'Failed to verify attestation' };
  }
} 