'use client';

import * as React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Chip, 
  Stack, 
  TextField, 
  MenuItem, 
  IconButton, 
  InputAdornment,
  Menu,
  Divider,
  Grid,
} from '@mui/material';
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  GetApp as ExportIcon,
  Delete as DeleteIcon,
  Block as DisableIcon,
  CheckCircle as EnableIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  EventBusy as ExpiryIcon,
} from '@mui/icons-material';
import CreateItemModal from '@/components/inventory/CreateItemModal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { ProductsService } from '@/api/services/ProductsService';
import { InventoryService } from '@/api/services/InventoryService';
import { CategoriesService } from '@/api/services/CategoriesService';
import { Product } from '@/api/models/Product';
import { Category } from '@/api/models/Category';
import { toast } from 'sonner';

export default function InventoryPage() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [summary, setSummary] = React.useState({ total_value: 0, low_stock_count: 0, expiring_count: 0 });
  const [search, setSearch] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('');
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<Product | null>(null);
  const [selectionModel, setSelectionModel] = React.useState<GridRowSelectionModel>({ type: 'include', ids: new Set() });
  
  // Row Dropdown Menu States
  const [rowMenuAnchor, setRowMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [activeRow, setActiveRow] = React.useState<Product | null>(null);

  // Unified Confirm Dialog State
  const [confirmState, setConfirmState] = React.useState<{
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    confirmColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'success' | 'info';
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => { },
  });

  const triggerConfirm = (config: {
    title: string;
    message: string;
    confirmLabel?: string;
    confirmColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'success' | 'info';
    onConfirm: () => void;
  }) => {
    setConfirmState({
      open: true,
      ...config,
    });
  };

  const closeConfirm = () => {
    setConfirmState(prev => ({ ...prev, open: false }));
  };

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await ProductsService.getProducts(search, selectedCategory);
      setProducts(response.data || []);
      
      const balanceResponse = await InventoryService.getInventoryBalance(undefined, undefined, selectedCategory);
      setSummary((balanceResponse as any).summary || { total_value: 0, low_stock_count: 0, expiring_count: 0 });
    } catch {
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory]);

  const fetchCategories = React.useCallback(async () => {
    try {
      const response = await CategoriesService.getCategories();
      setCategories(response as any);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  }, []);

  React.useEffect(() => {
    Promise.resolve().then(() => {
      fetchData();
      fetchCategories();
    });
  }, [fetchData, fetchCategories]);

  const handleCreateOrUpdate = async (product: Product) => {
    try {
      if (product.id) {
        await ProductsService.putProducts(product.id, product);
        toast.success('Item updated successfully');
      } else {
        await ProductsService.postProducts(product);
        toast.success(product.is_draft ? 'Item saved as draft' : 'Item created successfully');
      }
      setModalOpen(false);
      fetchData();
    } catch (error: any) {
      const errMsg = error?.body?.error || error?.message || 'Failed to save item';
      toast.error(errMsg);
    }
  };

  const executeBulkAction = async (action: 'enable' | 'disable' | 'delete') => {
    try {
      const ids = Array.from(selectionModel.ids) as string[];
      await ProductsService.postProductsBulkAction({ action, ids });
      toast.success(`Bulk ${action === 'delete' ? 'delete' : action + 'd'} completed successfully`);
      setSelectionModel({ type: 'include', ids: new Set() });
      fetchData();
    } catch {
      toast.error(`Failed to perform bulk ${action}`);
    }
  };

  const handleBulkAction = async (action: 'enable' | 'disable' | 'delete') => {
    if (action === 'delete') {
      triggerConfirm({
        title: 'Confirm Bulk Deletion',
        message: `Are you sure you want to permanently delete the ${selectionModel.ids.size} selected items? This action cannot be undone.`,
        confirmLabel: 'Delete All',
        confirmColor: 'error',
        onConfirm: () => executeBulkAction('delete')
      });
      return;
    }
    if (action === 'enable') {
      triggerConfirm({
        title: 'Confirm Bulk Enable',
        message: `Are you sure you want to enable the ${selectionModel.ids.size} selected items?`,
        confirmLabel: 'Enable All',
        confirmColor: 'success',
        onConfirm: () => executeBulkAction('enable')
      });
      return;
    }
    if (action === 'disable') {
      triggerConfirm({
        title: 'Confirm Bulk Disable',
        message: `Are you sure you want to disable the ${selectionModel.ids.size} selected items?`,
        confirmLabel: 'Disable All',
        confirmColor: 'warning',
        onConfirm: () => executeBulkAction('disable')
      });
      return;
    }
  };

  const handleDeleteItem = async () => {
    if (!activeRow?.id) return;
    try {
      await ProductsService.deleteProducts(activeRow.id);
      toast.success('Item deleted successfully');
      fetchData();
    } catch {
      toast.error('Failed to delete item');
    }
  };

  const handleExport = async () => {
    try {
      const csvContent = await ProductsService.getProductsBulkExport();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `products_export_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Inventory exported successfully');
    } catch {
      toast.error('Failed to export inventory');
    }
  };

  const columns: GridColDef[] = [
    { 
      field: 'name', 
      headerName: 'Item Name', 
      flex: 1, 
      minWidth: 250,
      headerAlign: 'left',
      align: 'left',
      renderCell: (params) => (
        <Box sx={{ py: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.2 }}>{params.value}</Typography>
          <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 0.5 }}>{params.row.product_type}</Typography>
        </Box>
      )
    },
    { 
      field: 'item_code', 
      headerName: 'Item Code', 
      width: 150,
      headerAlign: 'left',
      align: 'left',
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#475569' }}>
          {params.value || 'N/A'}
        </Typography>
      )
    },
    { 
      field: 'stock_quantity', 
      headerName: 'Stock', 
      width: 120,
      headerAlign: 'right',
      align: 'right',
      renderCell: (params) => {
        const isLow = params.row.low_stock_warning && params.value <= params.row.low_stock_quantity;
        return (
          <Typography sx={{ fontWeight: 800, color: isLow ? '#ef4444' : '#1e293b', fontSize: '0.875rem' }}>
            {params.value} {params.row.measuring_unit}
          </Typography>
        );
      }
    },
    { 
      field: 'sale_price', 
      headerName: 'Selling Price', 
      width: 140,
      headerAlign: 'right',
      align: 'right',
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>₹{params.value?.toLocaleString()}</Typography>
      )
    },
    { 
      field: 'wholesale_price', 
      headerName: 'Wholesale Price', 
      width: 140,
      headerAlign: 'right',
      align: 'right',
      renderCell: (params) => (
        <Typography sx={{ color: '#4c3bcf', fontWeight: 700, fontSize: '0.875rem' }}>₹{params.value?.toLocaleString()}</Typography>
      )
    },
    { 
      field: 'purchase_price', 
      headerName: 'Purchase Price', 
      width: 140,
      headerAlign: 'right',
      align: 'right',
      renderCell: (params) => (
        <Typography sx={{ color: '#64748b', fontSize: '0.875rem' }}>₹{params.value?.toLocaleString()}</Typography>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const isDraft = params.row.is_draft;
        const isActive = params.row.is_active;
        return (
          <Chip
            label={isDraft ? 'Draft' : isActive ? 'Active' : 'Inactive'}
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: '0.7rem',
              backgroundColor: isDraft ? '#fef3c7' : isActive ? '#dcfce7' : '#fee2e2',
              color: isDraft ? '#92400e' : isActive ? '#166534' : '#991b1b',
              borderRadius: '6px'
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
        <IconButton 
          size="small" 
          onClick={(e) => { 
            setRowMenuAnchor(e.currentTarget); 
            setActiveRow(params.row); 
          }}
        >
          <MoreVertIcon sx={{ color: '#94a3b8' }} />
        </IconButton>
      )
    }
  ];

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      {/* Header & Main Actions */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'flex-start' }, 
        gap: 2,
        mb: 4 
      }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#1a1a1a', letterSpacing: '-1.5px', mb: 0.5, fontSize: { xs: '1.8rem', sm: '2.125rem' } }}>
            Items
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
            Track stock levels, pricing and categories
          </Typography>
        </Box>
        <Stack direction="row" spacing={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            fullWidth={false}
            sx={{ borderRadius: '12px', fontWeight: 700, px: 3, borderColor: '#e2e8f0', color: '#475569' }}
            onClick={handleExport}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            fullWidth={false}
            sx={{ borderRadius: '12px', fontWeight: 700, px: 4, py: 1.2, boxShadow: '0 8px 16px rgba(76, 59, 207, 0.2)' }}
            onClick={() => { setSelectedRow(null); setModalOpen(true); }}
          >
            Create
          </Button>
        </Stack>
      </Box>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper sx={{ p: 3, borderRadius: '20px', display: 'flex', alignItems: 'center', gap: 2.5, border: '1px solid #f1f5f9' }}>
            <Box sx={{ backgroundColor: '#4c3bcf15', p: 1.5, borderRadius: '14px' }}>
              <InventoryIcon sx={{ color: '#4c3bcf' }} />
            </Box>
            <Box>
              <Typography sx={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Items Value</Typography>
              <Typography variant="h5" sx={{ fontWeight: 900 }}>₹{summary.total_value.toLocaleString()}</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper sx={{ p: 3, borderRadius: '20px', display: 'flex', alignItems: 'center', gap: 2.5, border: '1px solid #f1f5f9' }}>
            <Box sx={{ backgroundColor: '#ef444415', p: 1.5, borderRadius: '14px' }}>
              <WarningIcon sx={{ color: '#ef4444' }} />
            </Box>
            <Box>
              <Typography sx={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Low Stock Items</Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#ef4444' }}>{summary.low_stock_count}</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper sx={{ p: 3, borderRadius: '20px', display: 'flex', alignItems: 'center', gap: 2.5, border: '1px solid #f1f5f9' }}>
            <Box sx={{ backgroundColor: '#f59e0b15', p: 1.5, borderRadius: '14px' }}>
              <ExpiryIcon sx={{ color: '#f59e0b' }} />
            </Box>
            <Box>
              <Typography sx={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Items Expiring</Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#f59e0b' }}>{summary.expiring_count}</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters & Bulk Actions */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: '16px', border: '1px solid #f1f5f9', display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search by Name, Code, HSN, SKU..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flexGrow: 1, minWidth: '300px' }}
          slotProps={{
            input: {
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#94a3b8' }} /></InputAdornment>,
              sx: { borderRadius: '10px' }
            }
          }}
        />
        <TextField
          select
          size="small"
          label="Category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          sx={{ minWidth: '200px' }}
          slotProps={{ input: { sx: { borderRadius: '10px' } } }}
        >
          <MenuItem value="">All Categories</MenuItem>
          {categories.map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
          ))}
        </TextField>

        {selectionModel.ids.size > 0 && (
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1, p: 0.5, px: 2, backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#475569' }}>
              {selectionModel.ids.size} Selected
            </Typography>
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            <Button 
              size="small" 
              startIcon={<EnableIcon />} 
              onClick={() => handleBulkAction('enable')}
              sx={{ fontWeight: 700, color: '#166534' }}
            >
              Enable
            </Button>
            <Button 
              size="small" 
              startIcon={<DisableIcon />} 
              onClick={() => handleBulkAction('disable')}
              sx={{ fontWeight: 700, color: '#991b1b' }}
            >
              Disable
            </Button>
            <IconButton size="small" color="error" onClick={() => handleBulkAction('delete')}>
              <DeleteIcon />
            </IconButton>
          </Box>
        )}
      </Paper>

      {/* Table */}
      <Paper sx={{ width: '100%', height: 600, borderRadius: '20px', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
        <DataGrid
          rows={products}
          columns={columns}
          loading={loading}
          checkboxSelection
          onRowSelectionModelChange={(newSelection) => setSelectionModel(newSelection)}
          rowSelectionModel={selectionModel}
          disableRowSelectionOnClick
          rowHeight={72}
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
              display: 'flex',
              alignItems: 'center',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: '#f1f5f930',
            },
          }}
        />
      </Paper>

      {/* Action Menu (Dropdown for Row Actions) */}
      <Menu
        anchorEl={rowMenuAnchor}
        open={Boolean(rowMenuAnchor)}
        onClose={() => { setRowMenuAnchor(null); }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: '12px',
              minWidth: '160px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid #f1f5f9'
            }
          }
        }}
      >
        <MenuItem 
          onClick={() => {
            if (activeRow) {
              setSelectedRow(activeRow);
              setModalOpen(true);
            }
            setRowMenuAnchor(null);
          }}
          sx={{ fontWeight: 600, fontSize: '0.875rem', py: 1 }}
        >
          Edit Item
        </MenuItem>
        <MenuItem 
          onClick={() => {
            if (activeRow) {
              const isDeactivating = activeRow.is_active;
              triggerConfirm({
                title: isDeactivating ? 'Confirm Disable Item' : 'Confirm Enable Item',
                message: `Are you sure you want to ${isDeactivating ? 'disable' : 'enable'} "${activeRow.name}"?`,
                confirmLabel: isDeactivating ? 'Disable' : 'Enable',
                confirmColor: isDeactivating ? 'warning' : 'success',
                onConfirm: async () => {
                  try {
                    await ProductsService.putProducts(activeRow.id!, { 
                      ...activeRow, 
                      is_active: !activeRow.is_active 
                    });
                    toast.success(`Item ${isDeactivating ? 'disabled' : 'enabled'} successfully`);
                    fetchData();
                  } catch {
                    toast.error(`Failed to ${isDeactivating ? 'disable' : 'enable'} item`);
                  }
                }
              });
            }
            setRowMenuAnchor(null);
          }}
          sx={{ fontWeight: 600, fontSize: '0.875rem', py: 1 }}
        >
          {activeRow?.is_active ? 'Disable Item' : 'Enable Item'}
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem 
          onClick={() => {
            if (activeRow) {
              triggerConfirm({
                title: 'Confirm Deletion',
                message: `Are you sure you want to delete ${activeRow.name}? This action will soft-delete the item and remove it from active listings.`,
                confirmLabel: 'Delete',
                confirmColor: 'error',
                onConfirm: handleDeleteItem
              });
            }
            setRowMenuAnchor(null);
          }}
          sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#ef4444', py: 1 }}
        >
          Delete Item
        </MenuItem>
      </Menu>

      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        confirmLabel={confirmState.confirmLabel}
        confirmColor={confirmState.confirmColor}
        onClose={closeConfirm}
        onConfirm={confirmState.onConfirm}
      />

      <CreateItemModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleCreateOrUpdate}
        initialData={selectedRow}
      />
    </Box>
  );
}
