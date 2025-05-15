'use client';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { Program } from '@/lib/types';

interface ProgramSelectorProps {
  programs: Program[];
  selectedProgram: string;
  onProgramChange: (programId: string) => void;
  disabled?: boolean;
}

export function ProgramSelector({ programs, selectedProgram, onProgramChange, disabled = false }: ProgramSelectorProps) {
  return (
    <Box sx={{ minWidth: 240 }}>
      <FormControl fullWidth size="small" disabled={disabled}>
        <InputLabel id="program-select-label">Program</InputLabel>
        <Select
          labelId="program-select-label"
          value={selectedProgram}
          label="Program"
          onChange={e => onProgramChange(e.target.value)}
        >
          {programs.map((program) => (
            <MenuItem key={program.id} value={program.id}>
              {program.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
} 