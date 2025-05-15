'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

interface DataTableProps {
  entries: Array<{
    key: string;
    value: any;
  }>;
}

export function DataTable({ entries }: DataTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (key: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedRows(newExpanded);
  };

  const renderValue = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 1 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: 50 }}></TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Key</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {entries.map((entry) => {
            const isExpanded = expandedRows.has(entry.key);
            const value = renderValue(entry.value);
            const isMultiline = value.includes('\n');

            return (
              <TableRow key={entry.key} hover>
                <TableCell>
                  {isMultiline && (
                    <IconButton size="small" onClick={() => toggleRow(entry.key)}>
                      {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  )}
                </TableCell>
                <TableCell>{entry.key}</TableCell>
                <TableCell>
                  {isMultiline ? (
                    <Box>
                      {isExpanded ? (
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{value}</pre>
                      ) : (
                        <Typography noWrap>{value.split('\n')[0]}</Typography>
                      )}
                    </Box>
                  ) : (
                    <Typography>{value}</Typography>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
} 