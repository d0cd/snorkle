'use client';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { Mapping } from '@/lib/types';

interface MappingSelectorProps {
  mappings: Mapping[];
  selectedMapping: string;
  onMappingChange: (mappingId: string) => void;
  disabled?: boolean;
}

export function MappingSelector({ 
  mappings, 
  selectedMapping, 
  onMappingChange,
  disabled = false 
}: MappingSelectorProps) {
  return (
    <Box sx={{ minWidth: 240 }}>
      <FormControl fullWidth size="small" disabled={disabled}>
        <InputLabel id="mapping-select-label">Mapping</InputLabel>
        <Select
          labelId="mapping-select-label"
          value={selectedMapping}
          label="Mapping"
          onChange={e => onMappingChange(e.target.value)}
        >
          {mappings.map((mapping) => (
            <MenuItem key={mapping.id} value={mapping.id}>
              {mapping.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
} 