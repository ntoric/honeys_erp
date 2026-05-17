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
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import StatCard from '@/components/common/StatCard';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CancelIcon from '@mui/icons-material/Cancel';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CategoryIcon from '@mui/icons-material/Category';
import { ExpensesService, Expense } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ExpensesPage() {
  const theme = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('All');
  const [fromDate, setFromDate] = React.useState('');
  const [toDate, setToDate] = React.useState('');
  const [selectionModel, setSelectionModel] = React.useState<any>([]);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [activeRowId, setActiveRowId] = React.useState<string | null>(null);

  // Queries
  const { data: categoriesData } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: () => ExpensesService.getExpensesCategories()
  });

  const { data, isLoading } = useQuery({
    queryKey: ['expenses', searchTerm, categoryFilter, fromDate, toDate],
    queryFn: () => ExpensesService.getExpenses(
      categoryFilter === 'All' ? undefined : categoryFilter,
      fromDate || undefined,
      toDate || undefined,
      1,
      100
    )
  });

  const bulkMutation = useMutation({
    mutationFn: (data: { action: 'delete' | 'cancel' | 'export', ids: string[] }) => 
      ExpensesService.postExpensesBulkAction(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success(res.message || 'Action executed successfully');
      setSelectionModel([]);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ExpensesService.deleteExpenses(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense deleted');
      handleMenuClose();
    }
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => {
        // Need to fetch first to update status or just use a partial update if available
        // For now, let's just use bulk action for single cancel too
        return ExpensesService.postExpensesBulkAction({ action: 'cancel', ids: [id] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense cancelled');
      handleMenuClose();
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

  const handleBulkAction = (action: 'delete' | 'cancel' | 'export') => {
    if (selectionModel.length === 0) return;
    bulkMutation.mutate({ action, ids: selectionModel });
  };

  const columns: GridColDef[] = [
    { field: 'date', headerName: 'Date', width: 130 },
    { field: 'expense_no', headerName: 'Expense No', width: 150, renderCell: (params) => (
      <Typography sx={{ fontWeight: 700, color: theme.palette.primary.main }}>{params.value}</Typography>
    )},
    { field: 'party_name', headerName: 'Party Name', width: 220, renderCell: (params) => (
      <Typography sx={{ fontWeight: 600 }}>{params.value || 'N/A'}</Typography>
    )},
    { field: 'category_name', headerName: 'Category', width: 180, renderCell: (params) => (
      <Chip 
        icon={<CategoryIcon sx={{ fontSize: '1rem !important' }} />}
        label={params.value || 'Uncategorized'} 
        size="small"
        variant="outlined"
        sx={{ fontWeight: 600, border: 'none', backgroundColor: '#f1f5f9' }} 
      />
    )},
    { field: 'amount', headerName: 'Amount', width: 150, renderCell: (params) => (
      <Typography sx={{ fontWeight: 800 }}>₹{params.value?.toLocaleString()}</Typography>
    )},
    { field: 'status', headerName: 'Status', width: 130, renderCell: (params) => {
      const status = params.value?.toLowerCase();
      let color = '#10b981';
      let bgColor = '#f0fdf4';
      
      if (status === 'cancelled') { color = '#ef4444'; bgColor = '#fef2f2'; }

      return (
        <Chip 
          label={params.value?.toUpperCase()} 
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
        <IconButton onClick={(e) => {
            e.stopPropagation();
            handleMenuOpen(e, params.row.id);
        }}>
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  const expenses = data?.data || [];
  const totalAmount = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e293b', letterSpacing: '-1.5px', mb: 1 }}>
            Expenses
          </Typography>
          <Typography sx={{ color: '#64748b', fontWeight: 500 }}>
            Track and manage your business expenses.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<CategoryIcon />}
            component={Link}
            href="/expenses/categories"
            sx={{ borderRadius: '12px', fontWeight: 700, textTransform: 'none', px: 3 }}
          >
            Manage Categories
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={Link}
            href="/expenses/create"
            sx={{ 
              borderRadius: '12px', 
              fontWeight: 800, 
              textTransform: 'none', 
              px: 4,
              boxShadow: '0 8px 20px ' + alpha(theme.palette.primary.main, 0.3)
            }}
          >
            Create Expense
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard 
            title="Total Expenses" 
            value={`₹${totalAmount.toLocaleString()}`} 
            icon={<ReceiptIcon />} 
            color={theme.palette.primary.main} 
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard 
            title="Transactions" 
            value={expenses.length} 
            icon={<CalendarMonthIcon />} 
            color="#10b981" 
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard 
            title="Categories" 
            value={categoriesData?.length || 0} 
            icon={<CategoryIcon />} 
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
            placeholder="Search by expense number or party..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ 
              flexGrow: 1, 
              minWidth: '250px',
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
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Category</InputLabel>
            <Select
              label="Category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              sx={{ borderRadius: '12px' }}
            >
              <MenuItem value="All">All Categories</MenuItem>
              {categoriesData?.map(cat => (
                <MenuItem key={cat.id} value={cat.name}>{cat.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
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
          </Stack>

          {selectionModel.length > 0 && (
            <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
              <Button 
                variant="contained" 
                color="error" 
                size="small" 
                startIcon={<DeleteIcon />}
                onClick={() => handleBulkAction('delete')}
                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
              >
                Delete ({selectionModel.length})
              </Button>
              <Button 
                variant="outlined" 
                color="warning" 
                size="small" 
                startIcon={<CancelIcon />}
                onClick={() => handleBulkAction('cancel')}
                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
              >
                Cancel
              </Button>
            </Stack>
          )}
        </Box>

        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={expenses}
            columns={columns}
            loading={isLoading}
            checkboxSelection
            onRowSelectionModelChange={(newSelection) => setSelectionModel(newSelection)}
            onRowClick={(params) => router.push(`/expenses/${params.row.id}/edit`)}
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
        <MenuItem onClick={() => { router.push(`/expenses/${activeRowId}/edit`); handleMenuClose(); }}>
          <EditIcon sx={{ mr: 2, fontSize: 18, color: '#64748b' }} /> Edit Expense
        </MenuItem>
        <MenuItem onClick={() => { if (activeRowId) cancelMutation.mutate(activeRowId); }}>
          <CancelIcon sx={{ mr: 2, fontSize: 18, color: '#f59e0b' }} /> Cancel
        </MenuItem>
        <MenuItem onClick={() => { if (activeRowId) deleteMutation.mutate(activeRowId); }} sx={{ color: '#ef4444' }}>
          <DeleteIcon sx={{ mr: 2, fontSize: 18 }} /> Delete
        </MenuItem>
      </Menu>
    </Box>
  );
}
