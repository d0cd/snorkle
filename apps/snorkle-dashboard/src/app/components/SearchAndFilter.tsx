'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Popover from '@mui/material/Popover';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';
import ClearAllIcon from '@mui/icons-material/ClearAll';

interface SearchAndFilterProps {
  onSearch: (query: string) => void;
  onFilter: (filters: FilterOptions) => void;
  onExport: () => void;
  isLoading?: boolean;
}

export interface FilterOptions {
  keyType?: string;
  valueType?: string;
}

export function SearchAndFilter({ onSearch, onFilter, onExport, isLoading = false }: SearchAndFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({});
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFilter({});
  };

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} mb={4}>
      {/* Search Input */}
      <TextField
        variant="outlined"
        size="small"
        placeholder="Search keys or values..."
        value={searchQuery}
        onChange={handleSearchChange}
        disabled={isLoading}
        fullWidth
      />

      {/* Filter and Export Buttons */}
      <Box display="flex" gap={2} alignItems="center">
        <Button
          variant={hasActiveFilters ? 'contained' : 'outlined'}
          color={hasActiveFilters ? 'primary' : 'inherit'}
          startIcon={<FilterListIcon />}
          onClick={e => setAnchorEl(e.currentTarget)}
          disabled={isLoading}
        >
          Filters
        </Button>
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Box p={2} minWidth={260}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box fontWeight={600}>Filters</Box>
              {hasActiveFilters && (
                <Button size="small" color="inherit" startIcon={<ClearAllIcon />} onClick={clearFilters}>
                  Clear all
                </Button>
              )}
            </Box>
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel id="key-type-label">Key Type</InputLabel>
              <Select
                labelId="key-type-label"
                value={filters.keyType || ''}
                label="Key Type"
                onChange={e => handleFilterChange('keyType', e.target.value)}
                disabled={isLoading}
              >
                <MenuItem value="">All Key Types</MenuItem>
                <MenuItem value="field">Field</MenuItem>
                <MenuItem value="u8">u8</MenuItem>
                <MenuItem value="u128">u128</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel id="value-type-label">Value Type</InputLabel>
              <Select
                labelId="value-type-label"
                value={filters.valueType || ''}
                label="Value Type"
                onChange={e => handleFilterChange('valueType', e.target.value)}
                disabled={isLoading}
              >
                <MenuItem value="">All Value Types</MenuItem>
                <MenuItem value="Data">Data</MenuItem>
                <MenuItem value="any">Any</MenuItem>
                <MenuItem value="u128">u128</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Popover>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={onExport}
          disabled={isLoading}
        >
          Export CSV
        </Button>
      </Box>
    </Box>
  );
} 