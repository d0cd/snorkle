'use client';

import { useState, useEffect, useCallback } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { RefreshButton } from './RefreshButton';
import { ProgramSelector } from './ProgramSelector';
import { MappingSelector } from './MappingSelector';
import { DataTable } from './DataTable';
import { Pagination } from './Pagination';
import { SearchAndFilter } from './SearchAndFilter';
import { fetchPrograms, fetchMappingEntriesWithSdk, getMappingLengthWithSdk } from '@/lib/aleo';
import { useAleoSDK } from '@/lib/useAleoSDK';
import { exportToCsv, filterEntries, debounce } from '@/lib/utils';
import { handleError, getErrorMessage, AleoError } from '@/lib/error-handling';
import { Program, MappingEntry, DashboardConfig } from '@/lib/types';

export default function MappingDashboard() {
  const [sdk, sdkLoading, sdkError] = useAleoSDK();
  const [config, setConfig] = useState<DashboardConfig>({
    selectedProgram: '',
    selectedMapping: '',
    pageSize: 10,
    currentPage: 1,
  });
  const [programs, setPrograms] = useState<Program[]>([]);
  const [entries, setEntries] = useState<MappingEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<MappingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<AleoError | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<{ keyType?: string; valueType?: string }>({});

  const selectedProgram = programs.find(p => p.id === config.selectedProgram);
  const selectedMapping = selectedProgram?.mappings.find(m => m.id === config.selectedMapping);

  const fetchData = async () => {
    if (!sdk) return;
    try {
      setIsLoading(true);
      setError(null);
      const length = await getMappingLengthWithSdk(sdk, config.selectedProgram, config.selectedMapping);
      const totalPages = Math.ceil(length / config.pageSize);
      setTotalPages(totalPages);
      const data = await fetchMappingEntriesWithSdk(
        sdk,
        config.selectedProgram,
        config.selectedMapping,
        config.pageSize,
        config.currentPage
      );
      setEntries(data);
      setFilteredEntries(data);
    } catch (err) {
      const handledError = handleError(err);
      setError(handledError);
      console.error('Error fetching data:', handledError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!sdk) return;
    try {
      setIsRefreshing(true);
      setError(null);
      await fetchData();
    } catch (err) {
      const handledError = handleError(err);
      setError(handledError);
      console.error('Error refreshing data:', handledError);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsInitialLoading(true);
        setError(null);
        const programs = await fetchPrograms();
        setPrograms(programs);
        setIsInitialLoading(false);
      } catch (err) {
        const handledError = handleError(err);
        setError(handledError);
        setIsInitialLoading(false);
      }
    };
    initializeData();
  }, []);

  useEffect(() => {
    if (sdk && config.selectedProgram && config.selectedMapping) {
      fetchData();
    }
  }, [sdk, config.selectedProgram, config.selectedMapping, config.currentPage, config.pageSize]);

  const handleProgramChange = (programId: string) => {
    setConfig(prev => ({
      ...prev,
      selectedProgram: programId,
      selectedMapping: '',
      currentPage: 1,
    }));
    setEntries([]);
    setError(null);
  };

  const handleMappingChange = (mappingId: string) => {
    setConfig(prev => ({
      ...prev,
      selectedMapping: mappingId,
      currentPage: 1,
    }));
    setError(null);
  };

  const handlePageChange = (page: number) => {
    setConfig(prev => ({
      ...prev,
      currentPage: page,
    }));
  };

  const handleSearch = useCallback(
    debounce((query: string) => {
      setSearchQuery(query);
      const filtered = filterEntries(entries, query, filters);
      setFilteredEntries(filtered);
    }, 300),
    [entries, filters]
  );

  const handleFilter = useCallback((newFilters: { keyType?: string; valueType?: string }) => {
    setFilters(newFilters);
    const filtered = filterEntries(entries, searchQuery, newFilters);
    setFilteredEntries(filtered);
  }, [entries, searchQuery]);

  const handleExport = useCallback(() => {
    if (selectedMapping) {
      const filename = `${config.selectedProgram}_${config.selectedMapping}_data.csv`;
      exportToCsv(filteredEntries, filename);
    }
  }, [filteredEntries, config.selectedProgram, config.selectedMapping]);

  if (sdkLoading || isInitialLoading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  if (sdkError) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="text-center text-red-600 dark:text-red-300">
          Failed to load Aleo SDK: {sdkError.message}
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Program
          </label>
          <ProgramSelector
            programs={programs}
            selectedProgram={config.selectedProgram}
            onProgramChange={handleProgramChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Mapping
          </label>
          <MappingSelector
            mappings={selectedProgram?.mappings || []}
            selectedMapping={config.selectedMapping}
            onMappingChange={handleMappingChange}
            disabled={!config.selectedProgram}
          />
        </div>
      </div>
      {error && (
        <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-200">{getErrorMessage(error)}</p>
          <button
            onClick={handleRefresh}
            className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
          >
            Try again
          </button>
        </div>
      )}
      {selectedMapping && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              {selectedMapping.name}
            </h2>
            <SearchAndFilter
              onSearch={handleSearch}
              onFilter={handleFilter}
              onExport={handleExport}
              isLoading={isLoading}
            />
            <DataTable entries={filteredEntries} isLoading={isLoading} />
          </div>
          {!isLoading && filteredEntries.length > 0 && (
            <Pagination
              currentPage={config.currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      )}
    </ErrorBoundary>
  );
} 