'use client';
import Pagination from '@mui/material/Pagination';
import Box from '@mui/material/Box';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PaginationComponent({ currentPage, totalPages, onPageChange }: PaginationProps) {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" my={4}>
      <Pagination
        count={totalPages}
        page={currentPage}
        onChange={(_, page) => onPageChange(page)}
        color="primary"
        shape="rounded"
        showFirstButton
        showLastButton
      />
    </Box>
  );
} 