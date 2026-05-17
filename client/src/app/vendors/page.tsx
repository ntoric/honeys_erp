'use client';

import * as React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';

const columns: GridColDef[] = [
  { field: 'name', headerName: 'Vendor Name', width: 200 },
  { field: 'phone', headerName: 'Phone', width: 150 },
  { field: 'email', headerName: 'Email', width: 250 },
  { field: 'gstin', headerName: 'GSTIN', width: 150 },
  {
    field: 'outstanding_balance',
    headerName: 'Outstanding Balance',
    type: 'number',
    width: 180,
    valueFormatter: (params: any) => `₹${params?.value || 0}`
  },
];

const mockRows = [
  { id: '1', name: 'TechSupplies Ltd', phone: '+91 9111111111', email: 'sales@techsupplies.com', gstin: '22AAAAA0000A1Z5', outstanding_balance: 45000 },
  { id: '2', name: 'OfficeWorld Distributors', phone: '+91 9222222222', email: 'orders@officeworld.in', gstin: '29BBBBB1111B2Z6', outstanding_balance: 0 },
  { id: '3', name: 'NatureFarms Wholesale', phone: '+91 9333333333', email: 'supply@naturefarms.com', gstin: '27CCCCC2222C3Z7', outstanding_balance: 12500 },
];

export default function VendorsPage() {
  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Vendors / Suppliers
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          sx={{ px: 3, py: 1 }}
        >
          Add Vendor
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
          checkboxSelection
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
