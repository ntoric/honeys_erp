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
  IconButton, 
  InputAdornment,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Block as DisableIcon,
  CheckCircle as EnableIcon,
  FileDownload as DownloadIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import CreateCategoryModal from '@/components/inventory/CreateCategoryModal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { CategoriesService } from '@/api/services/CategoriesService';
import { Category } from '@/api/models/Category';
import { toast } from 'sonner';

export default function CategoriesPage() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<Category | null>(null);
  const [selectionModel, setSelectionModel] = React.useState<GridRowSelectionModel>({ type: 'include', ids: new Set() });
  const [actionMenuAnchor, setActionMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [activeCategory, setActiveCategory] = React.useState<Category | null>(null);

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

  const handleActionMenuOpen = (event: React.MouseEvent<HTMLElement>, category: Category) => {
    setActionMenuAnchor(event.currentTarget);
    setActiveCategory(category);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
  };

  const handleEdit = () => {
    if (activeCategory) {
      setSelectedRow(activeCategory);
      setModalOpen(true);
    }
    handleActionMenuClose();
  };

  const handleDelete = () => {
    if (activeCategory) {
      triggerConfirm({
        title: 'Delete Category',
        message: `Are you sure you want to permanently delete "${activeCategory.name}"? This action cannot be undone.`,
        confirmLabel: 'Delete',
        confirmColor: 'error',
        onConfirm: async () => {
          if (activeCategory.id) {
            try {
              await CategoriesService.deleteCategories(activeCategory.id);
              toast.success('Category deleted successfully');
              fetchData();
            } catch (error) {
              toast.error('Failed to delete category');
            }
          }
        }
      });
    }
    handleActionMenuClose();
  };

  const handleToggleStatus = () => {
    if (activeCategory) {
      const isDeactivating = activeCategory.is_active;
      if (isDeactivating) {
        triggerConfirm({
          title: 'Deactivate Category',
          message: `Are you sure you want to deactivate "${activeCategory.name}"?`,
          confirmLabel: 'Deactivate',
          confirmColor: 'warning',
          onConfirm: async () => {
            if (activeCategory.id) {
              try {
                await CategoriesService.putCategories(activeCategory.id, { 
                  ...activeCategory, 
                  is_active: false 
                });
                toast.success('Category deactivated successfully');
                fetchData();
              } catch (error) {
                toast.error('Failed to update status');
              }
            }
          }
        });
      } else {
        // Activate immediately
        (async () => {
          if (activeCategory.id) {
            try {
              await CategoriesService.putCategories(activeCategory.id, { 
                ...activeCategory, 
                is_active: true 
              });
              toast.success('Category activated successfully');
              fetchData();
            } catch (error) {
              toast.error('Failed to update status');
            }
          }
        })();
      }
    }
    handleActionMenuClose();
  };

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await CategoriesService.getCategories();
      let data = response as any;
      if (search) {
        data = data.filter((cat: Category) => 
          cat.name?.toLowerCase().includes(search.toLowerCase()) || 
          cat.sku?.toLowerCase().includes(search.toLowerCase())
        );
      }
      setCategories(data || []);
    } catch (error) {
      console.error('Failed to fetch categories', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [search]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateOrUpdate = async (category: Category) => {
    try {
      if (category.id) {
        await CategoriesService.putCategories(category.id, category);
        toast.success('Category updated successfully');
      } else {
        await CategoriesService.postCategories(category);
        toast.success('Category created successfully');
      }
      setModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Failed to save category', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save category');
    }
  };

  const handleBulkAction = (action: 'activate' | 'deactivate' | 'delete') => {
    const count = selectionModel.ids.size;
    if (action === 'delete') {
      triggerConfirm({
        title: 'Delete Selected Categories',
        message: `Are you sure you want to permanently delete the ${count} selected categories? This action cannot be undone.`,
        confirmLabel: 'Delete',
        confirmColor: 'error',
        onConfirm: async () => {
          try {
            const ids = Array.from(selectionModel.ids) as string[];
            await CategoriesService.postCategoriesBulkAction({ action, ids });
            toast.success(`Successfully deleted ${count} categories`);
            setSelectionModel({ type: 'include', ids: new Set() });
            fetchData();
          } catch (error) {
            toast.error('Failed to delete selected categories');
          }
        }
      });
    } else if (action === 'deactivate') {
      triggerConfirm({
        title: 'Deactivate Selected Categories',
        message: `Are you sure you want to deactivate the ${count} selected categories?`,
        confirmLabel: 'Deactivate',
        confirmColor: 'warning',
        onConfirm: async () => {
          try {
            const ids = Array.from(selectionModel.ids) as string[];
            await CategoriesService.postCategoriesBulkAction({ action, ids });
            toast.success(`Successfully deactivated ${count} categories`);
            setSelectionModel({ type: 'include', ids: new Set() });
            fetchData();
          } catch (error) {
            toast.error('Failed to deactivate selected categories');
          }
        }
      });
    } else {
      // Activate immediately
      (async () => {
        try {
          const ids = Array.from(selectionModel.ids) as string[];
          await CategoriesService.postCategoriesBulkAction({ action, ids });
          toast.success(`Successfully activated ${count} categories`);
          setSelectionModel({ type: 'include', ids: new Set() });
          fetchData();
        } catch (error) {
          toast.error('Failed to activate selected categories');
        }
      })();
    }
  };

  const handleExport = async () => {
    try {
      toast.info('Exporting categories...');
      const csvContent = await CategoriesService.getCategoriesBulkExport();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `categories_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Categories exported successfully');
    } catch (error) {
      console.error('Failed to export categories', error);
      toast.error('Failed to export categories');
    }
  };

  const columns: GridColDef[] = [
    { 
      field: 'name', 
      headerName: 'Category Name', 
      flex: 1, 
      minWidth: 200,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b', py: 2 }}>{params.value}</Typography>
      )
    },
    { field: 'sku', headerName: 'SKU / Code', width: 150 },
    { 
      field: 'created_at', 
      headerName: 'Created On', 
      width: 180,
      valueGetter: (value) => value ? new Date(value).toLocaleDateString() : '-'
    },
    { 
      field: 'updated_at', 
      headerName: 'Modified On', 
      width: 180,
      valueGetter: (value) => value ? new Date(value).toLocaleDateString() : '-'
    },
    {
      field: 'is_active',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => {
        const isActive = params.value;
        return (
          <Chip
            label={isActive ? 'Active' : 'Inactive'}
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: '0.7rem',
              backgroundColor: isActive ? '#dcfce7' : '#fee2e2',
              color: isActive ? '#166534' : '#991b1b',
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
        <IconButton size="small" onClick={(e) => handleActionMenuOpen(e, params.row)}>
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
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        gap: 2,
        mb: 4 
      }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#1a1a1a', letterSpacing: '-1.5px', mb: 0.5, fontSize: { xs: '1.8rem', sm: '2.125rem' } }}>
            Item Categories
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
            Manage product groupings and organizational structure
          </Typography>
        </Box>
        <Stack direction="row" spacing={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            sx={{ 
              borderRadius: '12px', 
              fontWeight: 700, 
              px: 3, 
              borderColor: '#e2e8f0', 
              color: '#475569',
              height: '40px',
              whiteSpace: 'nowrap'
            }}
            onClick={handleExport}
          >
            Export CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ 
              borderRadius: '12px', 
              fontWeight: 700, 
              px: 4, 
              height: '40px',
              whiteSpace: 'nowrap',
              boxShadow: '0 8px 16px rgba(76, 59, 207, 0.2)' 
            }}
            onClick={() => { setSelectedRow(null); setModalOpen(true); }}
          >
            New Category
          </Button>
        </Stack>
      </Box>

      {/* Filters & Bulk Actions */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: '16px', border: '1px solid #f1f5f9', display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search by Name, SKU..."
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

        {selectionModel.ids.size > 0 && (
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1, p: 0.5, px: 2, backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#475569' }}>
              {selectionModel.ids.size} Selected
            </Typography>
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            <Button 
              size="small" 
              startIcon={<EnableIcon />} 
              onClick={() => handleBulkAction('activate')}
              sx={{ fontWeight: 700, color: '#166534' }}
            >
              Activate
            </Button>
            <Button 
              size="small" 
              startIcon={<DisableIcon />} 
              onClick={() => handleBulkAction('deactivate')}
              sx={{ fontWeight: 700, color: '#991b1b' }}
            >
              Deactivate
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
          rows={categories}
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

      <CreateCategoryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleCreateOrUpdate}
        initialData={selectedRow}
      />

      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
        slotProps={{
          paper: {
            sx: {
              borderRadius: '12px',
              minWidth: 160,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              border: '1px solid #f1f5f9'
            }
          }
        }}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon><EditIcon fontSize="small" sx={{ color: '#64748b' }} /></ListItemIcon>
          <ListItemText primary="Edit" />
        </MenuItem>
        <MenuItem onClick={handleToggleStatus}>
          <ListItemIcon>{activeCategory?.is_active ? <DisableIcon fontSize="small" sx={{ color: '#f59e0b' }} /> : <EnableIcon fontSize="small" sx={{ color: '#22c55e' }} format="" />}</ListItemIcon>
          <ListItemText primary={activeCategory?.is_active ? 'Deactivate' : 'Activate'} />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDelete} sx={{ color: '#ef4444' }}>
          <ListItemIcon><DeleteIcon fontSize="small" sx={{ color: '#ef4444' }} /></ListItemIcon>
          <ListItemText primary="Delete" />
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
    </Box>
  );
}
