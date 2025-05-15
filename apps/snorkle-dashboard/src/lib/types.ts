export interface Program {
  id: string;
  name: string;
  mappings: Mapping[];
}

export interface Mapping {
  id: string;
  name: string;
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