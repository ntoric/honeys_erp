'use client';

import * as React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';

const columns: GridColDef[] = [
  { field: 'voucher_no', headerName: 'Voucher No', width: 130 },
  { field: 'posting_date', headerName: 'Date', width: 130 },
  { field: 'voucher_type', headerName: 'Type', width: 150 },
  { field: 'narration', headerName: 'Narration', width: 300 },
  {
    field: 'total_debit',
    headerName: 'Total Debit',
    type: 'number',
    width: 130,
    valueFormatter: (params: any) => `₹${params?.value || 0}`
  },
  {
    field: 'total_credit',
    headerName: 'Total Credit',
    type: 'number',
    width: 130,
    valueFormatter: (params: any) => `₹${params?.value || 0}`
  },
];

const mockRows = [
  { id: '1', voucher_no: 'JV-2024-001', posting_date: '2024-04-10', voucher_type: 'Journal', narration: 'Opening balance entry', total_debit: 50000, total_credit: 50000 },
  { id: '2', voucher_no: 'PAY-2024-012', posting_date: '2024-04-12', voucher_type: 'Payment', narration: 'Paid to TechSupplies Ltd', total_debit: 15000, total_credit: 15000 },
  { id: '3', voucher_no: 'REC-2024-008', posting_date: '2024-04-15', voucher_type: 'Receipt', narration: 'Payment received from Amit Kumar', total_debit: 4500, total_credit: 4500 },
];

export default function AccountingPage() {
  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Accounting (Journal Entries)
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          sx={{ px: 3, py: 1 }}
        >
          New Entry
        </Button>
      </Box>

      <Paper sx={{ width: '100%', height: 600, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)', borderRadius: 3, overflow: 'hidden' }}>
        <DataGrid
          rows={mockRows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[5, 10, 25]}
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #f1f5f9',
            },
          }}
        />
      </Paper>
    </Box>
  );
}
