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
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { PaymentsService } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';



export default function PaymentInPage() {
  const theme = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectionModel, setSelectionModel] = React.useState<any>([]);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [activeRowId, setActiveRowId] = React.useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['payments-in', searchTerm],
    queryFn: () => PaymentsService.getPayments('receive', undefined, undefined, undefined, undefined, 1, 100)
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => PaymentsService.deletePayments(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments-in'] });
      toast.success('Payment cancelled successfully');
      setAnchorEl(null);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to cancel payment');
    }
  });

  const bulkActionMutation = useMutation({
    mutationFn: ({ action, ids }: { action: string, ids: string[] }) => 
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/payments/bulk-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ids })
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments-in'] });
      toast.success('Bulk action completed');
      setSelectionModel([]);
    }
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, id: string) => {
    setAnchorEl(event.currentTarget);
    setActiveRowId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActiveRowId(null);
  };

  const columns: GridColDef[] = [
    { field: 'PaymentDate', headerName: 'Date', width: 130, renderCell: (params) => {
      const date = params.value || params.row.payment_date || params.row.paymentDate;
      return date ? new Date(date).toLocaleDateString() : '-';
    }},
    { field: 'PaymentNo', headerName: 'Payment ID', width: 150, renderCell: (params) => (
      <Typography sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
        {params.value || params.row.payment_no || params.row.paymentNo || 'N/A'}
      </Typography>
    )},
    { field: 'PartyName', headerName: 'Party Name', width: 220, renderCell: (params) => {
      const name = params.value || params.row.party_name || params.row.partyName || 'N/A';
      return (
        <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>{name}</Typography>
      );
    }},
    { field: 'AmountSettled', headerName: 'Amount Settled', width: 150, renderCell: (params) => {
        // Calculate from allocations if available, else just show amount for now
        const amount = params.row.Amount || 0;
        return <Typography sx={{ fontWeight: 600, color: '#64748b' }}>₹{amount.toLocaleString()}</Typography>;
    }},
    { field: 'Amount', headerName: 'Amount Received', width: 150, renderCell: (params) => {
      const amount = params.value ?? params.row.amount ?? 0;
      return (
        <Typography sx={{ fontWeight: 800 }}>₹{amount.toLocaleString()}</Typography>
      );
    }},
    { field: 'PaymentMode', headerName: 'Payment Mode', width: 150, renderCell: (params) => (
      <Chip 
        label={params.value?.toUpperCase()} 
        size="small"
        sx={{ fontWeight: 700, backgroundColor: '#f1f5f9', color: '#64748b', fontSize: '0.65rem' }} 
      />
    )},
    { field: 'Status', headerName: 'Status', width: 130, renderCell: (params) => {
      const status = params.value?.toLowerCase();
      let color = '#10b981';
      let bgColor = '#f0fdf4';
      
      if (status === 'cancelled') { color = '#ef4444'; bgColor = '#fef2f2'; }

      return (
        <Chip 
          label={params.value?.toUpperCase() || 'SUBMITTED'} 
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
        <IconButton onClick={(e) => { e.stopPropagation(); handleMenuOpen(e, params.row.ID); }}>
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  const payments = data?.data || [];
  const totalReceived = payments.reduce((acc: number, curr: any) => acc + (curr.Status !== 'cancelled' ? curr.Amount : 0), 0);

  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        gap: 2,
        mb: 5 
      }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e293b', letterSpacing: '-1.5px', mb: 1 }}>
            Payment In
          </Typography>
          <Typography sx={{ color: '#64748b', fontWeight: 500 }}>
            Record and manage payments received from your customers.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            fullWidth
            onClick={() => bulkActionMutation.mutate({ action: 'export', ids: selectionModel })}
            sx={{ borderRadius: '12px', fontWeight: 700, textTransform: 'none', px: 3 }}
          >
            Export
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            fullWidth
            component={Link}
            href="/sales/payments/create"
            sx={{ 
              borderRadius: '12px', 
              fontWeight: 800, 
              textTransform: 'none', 
              px: 4,
              boxShadow: '0 8px 20px ' + alpha(theme.palette.primary.main, 0.3)
            }}
          >
            Create
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard 
            title="Total Received (Today)" 
            value={`₹${totalReceived.toLocaleString()}`} 
            icon={<AccountBalanceWalletIcon />} 
            color={theme.palette.primary.main} 
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard 
            title="Total Transactions" 
            value={payments.length} 
            icon={<CheckCircleIcon />} 
            color="#10b981" 
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard 
            title="Cancelled" 
            value={payments.filter((p: any) => p.Status === 'cancelled').length} 
            icon={<CancelIcon />} 
            color="#ef4444" 
          />
        </Grid>
      </Grid>

      {selectionModel.length > 0 && (
        <Paper sx={{ p: 2, mb: 3, backgroundColor: alpha(theme.palette.primary.main, 0.05), borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
            {selectionModel.length} items selected
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button 
                variant="contained" 
                color="error" 
                size="small" 
                startIcon={<DeleteIcon />}
                onClick={() => bulkActionMutation.mutate({ action: 'delete', ids: selectionModel })}
                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
            >
                Delete
            </Button>
            <Button 
                variant="outlined" 
                color="error" 
                size="small" 
                startIcon={<CancelIcon />}
                onClick={() => bulkActionMutation.mutate({ action: 'cancel', ids: selectionModel })}
                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
            >
                Cancel
            </Button>
          </Stack>
        </Paper>
      )}

      <Paper sx={{ 
        p: 3, 
        borderRadius: '24px', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)', 
        border: '1px solid #f1f5f9',
      }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search by payment ID or party..."
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
          <Button
            variant="outlined"
            startIcon={<CalendarMonthIcon />}
            sx={{ borderRadius: '12px', color: '#64748b', borderColor: '#e2e8f0' }}
          >
            Last 30 Days
          </Button>
        </Box>

        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={payments}
            columns={columns}
            loading={isLoading}
            getRowId={(row) => row.ID}
            checkboxSelection
            onRowSelectionModelChange={(newSelectionModel) => {
                setSelectionModel(newSelectionModel);
            }}
            sx={{
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
        <MenuItem onClick={handleMenuClose}>
          <VisibilityIcon sx={{ mr: 2, fontSize: 18, color: '#64748b' }} /> View Detail
        </MenuItem>
        <MenuItem onClick={() => { if (activeRowId) deleteMutation.mutate(activeRowId); }} sx={{ color: '#ef4444' }}>
          <CancelIcon sx={{ mr: 2, fontSize: 18 }} /> Cancel Payment
        </MenuItem>
      </Menu>
    </Box>
  );
}
