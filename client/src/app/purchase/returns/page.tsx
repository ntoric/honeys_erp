'use client';

import * as React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Grid, 
  TextField, 
  InputAdornment, 
  MenuItem,
  IconButton,
  Tooltip,
  Stack,
  Chip,
  alpha,
  useTheme,
  Menu
} from '@mui/material';
import StatCard from '@/components/common/StatCard';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import { PurchaseReturnService } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PurchaseReturnsPage() {
  const theme = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('All');
  const [selectionModel, setSelectionModel] = React.useState<any>([]);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [activeRowId, setActiveRowId] = React.useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['purchase-returns', searchTerm, statusFilter],
    queryFn: () => PurchaseReturnService.getPurchaseReturns()
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => PurchaseReturnService.deletePurchaseReturn(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-returns'] });
      setAnchorEl(null);
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => PurchaseReturnService.postBulkAction('delete', ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-returns'] });
      setSelectionModel([]);
    }
  });

  const bulkCancelMutation = useMutation({
    mutationFn: (ids: string[]) => PurchaseReturnService.postBulkAction('cancel', ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-returns'] });
      setSelectionModel([]);
    }
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, id: string) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setActiveRowId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActiveRowId(null);
  };

  const columns: GridColDef[] = [
    { field: 'return_no', headerName: 'Return No', width: 150, renderCell: (params) => (
      <Typography sx={{ fontWeight: 700, color: theme.palette.primary.main }}>{params.value}</Typography>
    )},
    { field: 'return_date', headerName: 'Date', width: 130 },
    { field: 'party_name', headerName: 'Party Name', width: 220, renderCell: (params) => (
      <Box>
        <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>{params.value}</Typography>
        <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>{params.row.party_mobile}</Typography>
      </Box>
    )},
    { field: 'invoice_no', headerName: 'Invoice No', width: 150 },
    { field: 'grand_total', headerName: 'Amount', width: 150, renderCell: (params) => (
      <Typography sx={{ fontWeight: 800 }}>₹{params.value?.toLocaleString()}</Typography>
    )},
    { field: 'status', headerName: 'Status', width: 130, renderCell: (params) => {
      const status = params.value?.toLowerCase();
      let color = '#64748b';
      let bgColor = '#f1f5f9';
      
      if (status === 'completed' || status === 'paid') { color = '#10b981'; bgColor = '#f0fdf4'; }
      else if (status === 'pending') { color = '#f59e0b'; bgColor = '#fffbeb'; }
      else if (status === 'cancelled') { color = '#ef4444'; bgColor = '#fef2f2'; }
      else if (status === 'draft') { color = '#94a3b8'; bgColor = '#f8fafc'; }

      return (
        <Chip 
          label={params.value?.toUpperCase() || 'COMPLETED'} 
          size="small"
          sx={{ fontWeight: 700, backgroundColor: bgColor, color: color, fontSize: '0.65rem' }} 
        />
      );
    }},
    {
      field: 'actions',
      headerName: '',
      width: 60,
      sortable: false,
      renderCell: (params) => (
        <IconButton onClick={(e) => handleMenuOpen(e, params.row.id)}>
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  const returns = (data?.data || []).filter((r: any) => 
    r.return_no?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.party_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.invoice_no && r.invoice_no.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e293b', letterSpacing: '-1.5px', mb: 1 }}>
            Purchase Returns
          </Typography>
          <Typography sx={{ color: '#64748b', fontWeight: 500 }}>
            Manage returns to vendors and debit notes.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          {selectionModel.length > 0 && (
            <>
              <Button
                variant="outlined"
                color="warning"
                startIcon={<CancelIcon />}
                onClick={() => bulkCancelMutation.mutate(selectionModel)}
                sx={{ borderRadius: '12px', fontWeight: 700, textTransform: 'none', px: 3 }}
              >
                Cancel ({selectionModel.length})
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => bulkDeleteMutation.mutate(selectionModel)}
                sx={{ borderRadius: '12px', fontWeight: 700, textTransform: 'none', px: 3 }}
              >
                Delete ({selectionModel.length})
              </Button>
            </>
          )}
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            sx={{ borderRadius: '12px', fontWeight: 700, textTransform: 'none', px: 3 }}
          >
            Export
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={Link}
            href="/purchase/returns/create"
            sx={{ 
              borderRadius: '12px', 
              fontWeight: 800, 
              textTransform: 'none', 
              px: 4,
              boxShadow: '0 8px 20px ' + alpha(theme.palette.primary.main, 0.3)
            }}
          >
            Create Purchase Return
          </Button>
        </Stack>
      </Box>

      <Paper sx={{ 
        p: 3, 
        borderRadius: '24px', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)', 
        border: '1px solid #f1f5f9',
      }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search by return #, invoice # or party..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ 
              flexGrow: 1, 
              minWidth: '300px',
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: '#f8fafc',
                '& fieldset': { borderColor: 'transparent' },
                '&:hover fieldset': { borderColor: theme.palette.primary.main },
              }
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
              }
            }}
          />
          <TextField
            select
            size="small"
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 150, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
          >
            <MenuItem value="All">All Status</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="Draft">Draft</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
          </TextField>
        </Box>

        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={returns}
            columns={columns}
            loading={isLoading}
            checkboxSelection
            onRowSelectionModelChange={(newSelection) => setSelectionModel(newSelection)}
            onRowClick={(params) => router.push(`/purchase/returns/edit/${params.row.id}`)}
            sx={{
              cursor: 'pointer',
              border: 'none',
              '& .MuiDataGrid-columnHeader': {
                backgroundColor: '#f8fafc',
                color: '#64748b',
                fontWeight: 800,
                textTransform: 'uppercase',
                fontSize: '0.7rem',
                letterSpacing: '0.5px'
              },
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid #f1f5f9',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: '#334155'
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.02),
              }
            }}
          />
        </Box>
      </Paper>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        slotProps={{
          paper: {
            sx: { borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', minWidth: 150 }
          }
        }}
      >
        <MenuItem onClick={() => { router.push(`/purchase/returns/edit/${activeRowId}`); handleMenuClose(); }}>
          <EditIcon sx={{ mr: 2, fontSize: 18, color: '#64748b' }} /> Edit Return
        </MenuItem>
        <MenuItem onClick={() => { if (activeRowId) deleteMutation.mutate(activeRowId); }} sx={{ color: '#ef4444' }}>
          <DeleteIcon sx={{ mr: 2, fontSize: 18 }} /> Delete Return
        </MenuItem>
      </Menu>
    </Box>
  );
}
