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
  Checkbox,
  Grid,
  Divider,
} from '@mui/material';
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
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
  const [bulkMenuAnchor, setBulkMenuAnchor] = React.useState<null | HTMLElement>(null);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await ProductsService.getProducts(search, selectedCategory);
      setProducts(response.data || []);
      
      const balanceResponse = await InventoryService.getInventoryBalance(undefined, undefined, selectedCategory);
      setSummary((balanceResponse as any).summary || { total_value: 0, low_stock_count: 0, expiring_count: 0 });
    } catch (error) {
      console.error('Failed to fetch inventory', error);
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory]);

  React.useEffect(() => {
    fetchData();
    fetchCategories();
  }, [fetchData]);

  const fetchCategories = async () => {
    try {
      const response = await CategoriesService.getCategories();
      setCategories(response as any);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  };

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
    } catch (error) {
      console.error('Failed to save product', error);
      toast.error('Failed to save item');
    }
  };

  const handleBulkAction = async (action: 'enable' | 'disable' | 'delete') => {
    try {
      const ids = Array.from(selectionModel.ids);
      for (const id of ids) {
        if (action === 'delete') {
          await ProductsService.deleteProducts(id as string);
        } else {
          const product = products.find(p => p.id === id);
          if (product) {
            await ProductsService.putProducts(id as string, { ...product, is_active: action === 'enable' });
          }
        }
      }
      toast.success(`Bulk ${action} completed`);
      setBulkMenuAnchor(null);
      fetchData();
    } catch (error) {
      toast.error(`Failed to perform bulk ${action}`);
    }
  };

  const columns: GridColDef[] = [
    { 
      field: 'name', 
      headerName: 'Item Name', 
      flex: 1, 
      minWidth: 250,
      renderCell: (params) => (
        <Box sx={{ py: 1 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>{params.value}</Typography>
          <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>{params.row.product_type}</Typography>
        </Box>
      )
    },
    { field: 'item_code', headerName: 'Item Code', width: 150 },
    { 
      field: 'stock_quantity', 
      headerName: 'Stock', 
      width: 120,
      renderCell: (params) => {
        const isLow = params.row.low_stock_warning && params.value <= params.row.low_stock_quantity;
        return (
          <Typography sx={{ fontWeight: 800, color: isLow ? '#ef4444' : '#1e293b' }}>
            {params.value} {params.row.measuring_unit}
          </Typography>
        );
      }
    },
    { 
      field: 'sale_price', 
      headerName: 'Selling Price', 
      width: 140,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 700 }}>₹{params.value?.toLocaleString()}</Typography>
      )
    },
    { 
      field: 'wholesale_price', 
      headerName: 'Wholesale Price', 
      width: 140,
      renderCell: (params) => (
        <Typography sx={{ color: '#4c3bcf', fontWeight: 700 }}>₹{params.value?.toLocaleString()}</Typography>
      )
    },
    { 
      field: 'purchase_price', 
      headerName: 'Purchase Price', 
      width: 140,
      renderCell: (params) => (
        <Typography sx={{ color: '#64748b' }}>₹{params.value?.toLocaleString()}</Typography>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
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
      renderCell: (params) => (
        <IconButton size="small" onClick={() => { setSelectedRow(params.row); setModalOpen(true); }}>
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
            fullWidth
            sx={{ borderRadius: '12px', fontWeight: 700, px: 3, borderColor: '#e2e8f0', color: '#475569' }}
            onClick={() => ProductsService.getProductsBulkExport('csv')}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            fullWidth
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
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: '#f1f5f930',
            },
          }}
        />
      </Paper>

      <CreateItemModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleCreateOrUpdate}
        initialData={selectedRow}
      />
    </Box>
  );
}
