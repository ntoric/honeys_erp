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
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import CancelIcon from '@mui/icons-material/Cancel';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { PurchaseService } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { OpenAPI } from '@/api/core/OpenAPI';
import { request as __request } from '@/api/core/request';



export default function PurchaseInvoicesPage() {
  const theme = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('All');
  const [fromDate, setFromDate] = React.useState('');
  const [toDate, setToDate] = React.useState('');
  const [selectionModel, setSelectionModel] = React.useState<any>({ type: 'include', ids: new Set<string>() });
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [activeRowId, setActiveRowId] = React.useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['purchase-invoices', searchTerm, statusFilter, fromDate, toDate],
    queryFn: () => __request(OpenAPI, {
      method: 'GET',
      url: '/purchase/bills',
      query: {
        'status': statusFilter === 'All' ? undefined : statusFilter.toLowerCase(),
        'from_date': fromDate || undefined,
        'to_date': toDate || undefined,
        'query': searchTerm || undefined
      }
    })
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/purchase/bills/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-invoices'] });
      handleMenuClose();
    }
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const invoice = invoices.find((inv: any) => inv.id === id);
      if (!invoice) return;
      return axios.put(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/purchase/bills/${id}`, {
        ...invoice,
        status: 'cancelled'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-invoices'] });
      handleMenuClose();
    }
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice? This will revert stock.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCancel = (id: string) => {
    if (window.confirm('Are you sure you want to cancel this invoice? This will revert stock.')) {
      cancelMutation.mutate(id);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, id: string) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setActiveRowId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActiveRowId(null);
  };

  const handleExport = (exportData: any[]) => {
    const headers = ['Invoice No', 'Date', 'Party Name', 'Party Mobile', 'Amount', 'Status'];
    const csvRows = [
      headers.join(','),
      ...exportData.map(inv => [
        inv.invoice_no || inv.invoiceNo || inv.bill_no || inv.billNo,
        inv.invoice_date || inv.invoiceDate || inv.bill_date || inv.billDate,
        `"${inv.party_name || inv.partyName}"`,
        inv.party_mobile || inv.partyMobile,
        inv.grand_total || inv.grandTotal,
        inv.status
      ].join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `purchase_invoices_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkAction = async (action: 'delete' | 'cancel' | 'export') => {
    if (action === 'export') {
      const selectedData = invoices.filter((inv: any) => selectionModel.ids.has(inv.id));
      handleExport(selectedData);
      return;
    }

    if (!window.confirm(`Are you sure you want to ${action} ${selectionModel.ids.size} invoices?`)) return;

    try {
      const selectedIds = Array.from(selectionModel.ids) as string[];
      if (action === 'delete') {
        for (const id of selectedIds) {
          await deleteMutation.mutateAsync(id);
        }
      } else if (action === 'cancel') {
        for (const id of selectedIds) {
          await cancelMutation.mutateAsync(id);
        }
      }
      queryClient.invalidateQueries({ queryKey: ['purchase-invoices'] });
      setSelectionModel({ type: 'include', ids: new Set<string>() });
    } catch (error) {
      console.error(`Bulk ${action} failed`, error);
    }
  };

  const columns: GridColDef[] = [
    { 
      field: 'invoice_no', 
      headerName: 'Invoice No', 
      width: 150, 
      headerAlign: 'left',
      align: 'left',
      renderCell: (params) => (
        <Typography 
          component={Link} 
          href={`/purchase/invoices/view/${params.row.id}`}
          sx={{ fontWeight: 700, color: theme.palette.primary.main, textDecoration: 'none', '&:hover': { textDecoration: 'underline' }, fontSize: '0.875rem' }}
        >
          {params.value || params.row.invoiceNo || params.row.bill_no || 'N/A'}
        </Typography>
      )
    },
    { 
      field: 'invoice_date', 
      headerName: 'Date', 
      width: 130, 
      headerAlign: 'left',
      align: 'left',
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
          {params.value || params.row.invoiceDate || params.row.bill_date || 'N/A'}
        </Typography>
      )
    },
    { 
      field: 'party_name', 
      headerName: 'Party Name', 
      width: 250, 
      headerAlign: 'left',
      align: 'left',
      renderCell: (params) => {
        const name = params.value || params.row.partyName || 'N/A';
        const mobile = params.row.party_mobile || params.row.partyMobile || '';
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', py: 1 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#1e293b', lineHeight: 1.2 }}>{name}</Typography>
            {mobile && <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', mt: 0.5 }}>{mobile}</Typography>}
          </Box>
        );
      }
    },
    { 
      field: 'due_date', 
      headerName: 'Due In', 
      width: 150, 
      headerAlign: 'left',
      align: 'left',
      renderCell: (params) => {
        const dueDate = params.value || params.row.dueDate;
        if (!dueDate) return 'N/A';
        let text = dueDate;
        try {
          const date = new Date(dueDate);
          text = formatDistanceToNow(date, { addSuffix: true });
        } catch (e) {}
        return (
          <Typography sx={{ fontSize: '0.875rem', color: '#64748b' }}>{text}</Typography>
        );
      }
    },
    { 
      field: 'grand_total', 
      headerName: 'Amount', 
      width: 150, 
      headerAlign: 'right',
      align: 'right',
      renderCell: (params) => {
        const amount = params.value ?? params.row.grandTotal ?? 0;
        return (
          <Typography sx={{ fontWeight: 800, fontSize: '0.95rem' }}>₹{amount.toLocaleString()}</Typography>
        );
      }
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 130, 
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const status = params.value?.toLowerCase();
        let color = '#64748b';
        let bgColor = '#f1f5f9';
        
        if (status === 'paid') { color = '#10b981'; bgColor = '#f0fdf4'; }
        else if (status === 'unpaid' || status === 'overdue') { color = '#f59e0b'; bgColor = '#fffbeb'; }
        else if (status === 'cancelled') { color = '#ef4444'; bgColor = '#fef2f2'; }
        else if (status === 'draft') { color = '#94a3b8'; bgColor = '#f8fafc'; }

        return (
          <Chip 
            label={params.value?.toUpperCase()} 
            size="small"
            sx={{ 
              fontWeight: 800, 
              backgroundColor: bgColor, 
              color: color, 
              fontSize: '0.65rem',
              height: '24px',
              borderRadius: '6px',
              border: `1px solid ${alpha(color, 0.1)}`
            }} 
          />
        );
      }
    },
    {
      field: 'actions',
      headerName: '',
      width: 60,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <IconButton onClick={(e) => handleMenuOpen(e, params.row.id)}>
          <MoreVertIcon sx={{ color: '#94a3b8' }} />
        </IconButton>
      ),
    },
  ];

  const invoices = (data as any)?.data || [];
  const summary = (data as any)?.summary || { total_purchase: 0, paid_amount: 0, unpaid_amount: 0 };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e293b', letterSpacing: '-1.5px', mb: 1 }}>
            Purchase Invoices
          </Typography>
          <Typography sx={{ color: '#64748b', fontWeight: 500 }}>
            Manage your purchases and vendor bills efficiently.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            sx={{ borderRadius: '12px', fontWeight: 700, textTransform: 'none', px: 3 }}
            onClick={() => handleExport(invoices)}
          >
            Export All
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={Link}
            href="/purchase/invoices/create"
            sx={{ 
              borderRadius: '12px', 
              fontWeight: 800, 
              textTransform: 'none', 
              px: 4,
              boxShadow: '0 8px 20px ' + alpha(theme.palette.primary.main, 0.3)
            }}
          >
            Create New Purchase
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard 
            title="Total Purchase" 
            value={`₹${summary.total_purchase?.toLocaleString()}`} 
            icon={<LocalShippingIcon />} 
            color={theme.palette.primary.main} 
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard 
            title="Paid" 
            value={`₹${summary.paid_amount?.toLocaleString()}`} 
            icon={<CheckCircleIcon />} 
            color="#10b981" 
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard 
            title="Unpaid" 
            value={`₹${summary.unpaid_amount?.toLocaleString()}`} 
            icon={<ErrorIcon />} 
            color="#f59e0b" 
          />
        </Grid>
      </Grid>

      <Paper sx={{ 
        p: 3, 
        borderRadius: '24px', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)', 
        border: '1px solid #f1f5f9',
      }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search by invoice number or vendor..."
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
            <MenuItem value="Paid">Paid</MenuItem>
            <MenuItem value="Unpaid">Unpaid</MenuItem>
            <MenuItem value="Draft">Draft</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
          </TextField>
          <TextField
            type="date"
            size="small"
            label="From"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
          />
          <TextField
            type="date"
            size="small"
            label="To"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
          />
          <Button
            variant="outlined"
            startIcon={<CalendarMonthIcon />}
            sx={{ borderRadius: '12px', color: '#64748b', borderColor: '#e2e8f0' }}
            onClick={() => {
              const thirtyDaysAgo = new Date();
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
              setFromDate(thirtyDaysAgo.toISOString().split('T')[0]);
              setToDate(new Date().toISOString().split('T')[0]);
            }}
          >
            Last 30 Days
          </Button>
          {selectionModel.ids.size > 0 && (
            <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
              <Button 
                variant="outlined" 
                color="error" 
                startIcon={<DeleteIcon />} 
                onClick={() => handleBulkAction('delete')}
                sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}
              >
                Delete ({selectionModel.ids.size})
              </Button>
              <Button 
                variant="outlined" 
                color="warning" 
                startIcon={<CancelIcon />} 
                onClick={() => handleBulkAction('cancel')}
                sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}
              >
                Cancel
              </Button>
              <Button 
                variant="outlined" 
                color="primary" 
                startIcon={<FileDownloadIcon />} 
                onClick={() => handleBulkAction('export')}
                sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}
              >
                Export
              </Button>
            </Stack>
          )}
        </Box>

        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={invoices}
            columns={columns}
            loading={isLoading}
            onRowSelectionModelChange={(newSelectionModel) => setSelectionModel(newSelectionModel)}
            rowSelectionModel={selectionModel}
            checkboxSelection
            disableRowSelectionOnClick
            sx={{
              border: 'none',
              rowHeight: 64,
              '& .MuiDataGrid-columnHeader': {
                backgroundColor: '#f8fafc',
                color: '#64748b',
                fontWeight: 800,
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                letterSpacing: '1px',
                borderBottom: '2px solid #f1f5f9'
              },
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                py: 1
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.02),
              },
              '& .MuiDataGrid-columnSeparator': {
                display: 'none'
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
        <MenuItem onClick={() => { router.push(`/purchase/invoices/view/${activeRowId}`); handleMenuClose(); }}>
          <VisibilityIcon sx={{ mr: 2, fontSize: 18, color: '#64748b' }} /> View Detail
        </MenuItem>
        <MenuItem onClick={() => { router.push(`/purchase/invoices/edit/${activeRowId}`); handleMenuClose(); }}>
          <EditIcon sx={{ mr: 2, fontSize: 18, color: '#64748b' }} /> Edit Invoice
        </MenuItem>
        <MenuItem onClick={() => { activeRowId && handleCancel(activeRowId); }} sx={{ color: '#ef4444' }}>
          <CancelIcon sx={{ mr: 2, fontSize: 18 }} /> Cancel Invoice
        </MenuItem>
        <MenuItem onClick={() => { activeRowId && handleDelete(activeRowId); }} sx={{ color: '#ef4444' }}>
          <DeleteIcon sx={{ mr: 2, fontSize: 18 }} /> Delete Invoice
        </MenuItem>
      </Menu>
    </Box>
  );
}
