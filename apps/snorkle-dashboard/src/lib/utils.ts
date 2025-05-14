import { MappingEntry } from './types';

export function exportToCsv(entries: MappingEntry[], filename: string = 'mapping-data.csv') {
  // Convert entries to CSV format
  const headers = ['Key', 'Value'];
  const rows = entries.map(entry => [
    entry.key,
    typeof entry.value === 'object' ? JSON.stringify(entry.value) : String(entry.value)
  ]);

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function filterEntries(
  entries: MappingEntry[],
  searchQuery: string,
  filters: { keyType?: string; valueType?: string }
): MappingEntry[] {
  return entries.filter(entry => {
    // Search filter
    const searchMatch = searchQuery === '' || 
      entry.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(entry.value).toLowerCase().includes(searchQuery.toLowerCase());

    // Type filters
    const keyTypeMatch = !filters.keyType || entry.key.startsWith(filters.keyType);
    const valueTypeMatch = !filters.valueType || typeof entry.value === filters.valueType;

    return searchMatch && keyTypeMatch && valueTypeMatch;
  });
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
} 