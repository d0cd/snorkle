import { Program, Mapping, MappingEntry, AttestationResult } from './types';
import { ALEO_CONFIG } from './config';
import * as aleo from '@provablehq/sdk';

// Initialize Aleo client
const aleoClient = new aleo.AleoNetworkClient(ALEO_CONFIG.rpcUrl);

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

export const fetchPrograms = async (network: string, endpoint: string): Promise<Program[]> => {
  try {
    const client = new aleo.AleoNetworkClient(endpoint);
    const programs = await client.getPrograms();
    return programs.map(program => ({
      id: program.id,
      name: program.name,
      owner: program.owner,
      imports: program.imports || [],
      mappings: program.mappings || []
    }));
  } catch (error) {
    console.error('Error fetching programs:', error);
    throw error;
  }
};

export const fetchMappingEntries = async (
  network: string,
  endpoint: string,
  program: string,
  mapping: string
): Promise<MappingEntry[]> => {
  try {
    const client = new aleo.AleoNetworkClient(endpoint);
    const entries = await client.getMappingEntries(program, mapping);
    return entries.map(entry => ({
      key: entry.key,
      value: entry.value
    }));
  } catch (error) {
    console.error('Error fetching mapping entries:', error);
    throw error;
  }
};

export const getMappingLength = async (
  network: string,
  endpoint: string,
  program: string,
  mapping: string
): Promise<number> => {
  try {
    const client = new aleo.AleoNetworkClient(endpoint);
    const length = await client.getMappingLength(program, mapping);
    return length;
  } catch (error) {
    console.error('Error getting mapping length:', error);
    throw error;
  }
};

export const parseAleoValue = (value: string): any => {
  try {
    return aleo.parseAleoValue(value);
  } catch (error) {
    console.error('Error parsing Aleo value:', error);
    return null;
  }
};

// Helper function to format Aleo values
export function formatAleoValue(value: any): string {
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
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

/**
 * Verifies an attestation for a specific oracle
 * @param programId - The program ID to check against
 * @param oracleAddress - The oracle address to verify
 * @param attestationHash - The attestation hash to verify
 * @param network - The network to check on (mainnet/testnet/canary)
 * @returns Promise<AttestationResult>
 */
export async function verifyAttestation(
  programId: string,
  oracleAddress: string,
  attestationHash: string,
  network: string
): Promise<AttestationResult> {
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
        isValid: true
      };
    }

    return { isValid: false, error: 'Attestation hash does not match' };
  } catch (error) {
    return { isValid: false, error: 'Failed to verify attestation' };
  }
} 