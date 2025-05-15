export interface Program {
  id: string;
  name: string;
  owner: string;
  imports: string[];
  mappings: string[];
}

export interface Mapping {
  id: string;
  name: string;
  programId: string;
  keyType: string;
  valueType: string;
}

export interface MappingEntry {
  key: string;
  value: any;
}

export interface DashboardConfig {
  selectedProgram: string;
  selectedMapping: string;
  pageSize: number;
  currentPage: number;
}

export interface AttestationResult {
  isValid: boolean;
  error?: string;
} 