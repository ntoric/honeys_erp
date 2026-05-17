'use client';

import * as React from 'react';
import { Box, Typography, Button, Paper, Avatar } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const columns: GridColDef[] = [
  { field: 'name', headerName: 'Customer Name', width: 250, renderCell: (params) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: '#4c3bcf20', color: '#4c3bcf', fontWeight: 800 }}>
        {params.value.split(' ').map((n: string) => n[0]).join('')}
      </Avatar>
      <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' }}>{params.value}</Typography>
    </Box>
  )},
  { field: 'phone', headerName: 'Phone', width: 150 },
  { field: 'email', headerName: 'Email', width: 250, renderCell: (params) => (
    <Typography sx={{ color: '#64748b', fontSize: '0.9rem' }}>{params.value}</Typography>
  )},
  { field: 'loyalty_points', headerName: 'Loyalty Points', type: 'number', width: 150, renderCell: (params) => (
    <Box sx={{ p: 1, px: 2, borderRadius: '20px', backgroundColor: '#ffb34415', color: '#e09a2f', fontWeight: 700, display: 'inline-flex', fontSize: '0.8rem' }}>
      {params.value} pts
    </Box>
  )},
  {
    field: 'outstanding_balance',
    headerName: 'Outstanding Balance',
    type: 'number',
    width: 200,
    renderCell: (params) => (
      <Typography sx={{ fontWeight: 800, color: (params.value as number) > 0 ? '#ff6b6b' : '#48d1cc' }}>
        ₹{params.value || 0}
      </Typography>
    )
  },
];

const mockRows = [
  { id: '1', name: 'Rahul Sharma', phone: '+91 9876543210', email: 'rahul.s@example.com', loyalty_points: 450, outstanding_balance: 1200 },
  { id: '2', name: 'Priya Patel', phone: '+91 8765432109', email: 'priya.p@example.com', loyalty_points: 120, outstanding_balance: 0 },
  { id: '3', name: 'Amit Kumar', phone: '+91 7654321098', email: 'amit.k@example.com', loyalty_points: 890, outstanding_balance: 4500 },
  { id: '4', name: 'Sneha Gupta', phone: '+91 6543210987', email: 'sneha.g@example.com', loyalty_points: 0, outstanding_balance: 0 },
];

export default function CustomersPage() {
  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a1a1a', letterSpacing: '-1px' }}>
          Customers
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PersonAddIcon />}
          sx={{ px: 4, py: 1.2, borderRadius: '12px', fontWeight: 700 }}
        >
          Add Customer
        </Button>
      </Box>

      <Paper sx={{ width: '100%', height: 600, overflow: 'hidden' }}>
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
            '& .MuiDataGrid-columnHeader': {
              backgroundColor: '#fcfcfd',
              color: '#64748b',
              fontWeight: 700,
              textTransform: 'uppercase',
              fontSize: '0.75rem',
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #f1f5f9',
              py: 2
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: '#f8fafc',
            },
            '& .MuiDataGrid-columnSeparator': {
              display: 'none',
            },
          }}
        />
      </Paper>
    </Box>
  );
}

