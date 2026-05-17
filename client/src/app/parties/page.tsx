'use client';

import * as React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Avatar,
  Grid,
  TextField,
  InputAdornment,
  MenuItem,
  Menu,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Chip,
  alpha,
  useTheme
} from '@mui/material';
import StatCard from '@/components/common/StatCard';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import BlockIcon from '@mui/icons-material/Block';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { PartiesService, Party } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import QuickAddPartyDialog from '@/components/parties/QuickAddPartyDialog';
import { toast } from 'sonner';



export default function PartiesPage() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('All');
  const [party_typeFilter, setPartyTypeFilter] = React.useState('All');
  const [selectionModel, setSelectionModel] = React.useState<GridRowSelectionModel>({ type: 'include', ids: new Set<string>() });
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedParty, setSelectedParty] = React.useState<Partial<Party> | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const [activeRow, setActiveRow] = React.useState<Party | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, row: Party) => {
    setMenuAnchorEl(event.currentTarget);
    setActiveRow(row);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setActiveRow(null);
  };

  const updatePartyMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Party }) =>
      PartiesService.putParties(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parties'] });
      toast.success('Party updated successfully');
      handleMenuClose();
    },
    onError: (err: any) => {
      toast.error(err.body?.error || err.message || 'Failed to update party');
    }
  });

  const deletePartyMutation = useMutation({
    mutationFn: (id: string) =>
      PartiesService.deleteParties(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parties'] });
      toast.success('Party deleted successfully');
      handleMenuClose();
    },
    onError: (err: any) => {
      toast.error(err.body?.error || err.message || 'Failed to delete party');
    }
  });

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

  const { data, isLoading } = useQuery({
    queryKey: ['parties', searchTerm, categoryFilter, party_typeFilter],
    queryFn: () => PartiesService.getParties(
      party_typeFilter === 'All' ? undefined : party_typeFilter.toLowerCase() as any,
      searchTerm || undefined,
      categoryFilter === 'All' ? undefined : categoryFilter
    )
  });

  const handleExport = (exportData: any[]) => {
    const headers = ['Name', 'Party Type', 'Category', 'Mobile', 'Email', 'Balance', 'Blocked Status', 'Active Status'];
    const csvRows = [
      headers.join(','),
      ...exportData.map(party => [
        `"${(party.name || '').replace(/"/g, '""')}"`,
        party.party_type || 'customer',
        party.category || 'Retail',
        party.mobile || '',
        `"${(party.email || '').replace(/"/g, '""')}"`,
        party.balance || 0,
        party.is_blocked ? 'Blocked' : 'Active',
        party.is_active ? 'Active' : 'Inactive'
      ].join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `parties_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const bulkActionMutation = useMutation({
    mutationFn: ({ action, ids }: { action: string, ids: string[] }) =>
      PartiesService.postPartiesBulkAction({ action: action as any, ids }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['parties'] });
      setSelectionModel({ type: 'include', ids: new Set<string>() });
      const actionLabel = variables.action === 'delete' ? 'deleted' : variables.action === 'block' ? 'blocked' : 'unblocked';
      toast.success(`Successfully ${actionLabel} selected parties`);
    },
    onError: (err: any) => {
      toast.error(err.body?.error || err.message || 'Failed to complete bulk action');
    }
  });

  const columns: GridColDef[] = [
    {
      field: 'name', headerName: 'Name', flex: 1, minWidth: 200, renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{
            width: 36,
            height: 36,
            fontSize: '0.9rem',
            bgcolor: params.row.party_type === 'customer' ? alpha(theme.palette.primary.main, 0.1) : alpha('#f59e0b', 0.1),
            color: params.row.party_type === 'customer' ? theme.palette.primary.main : '#f59e0b',
            fontWeight: 800
          }}>
            {params.value?.[0] || 'P'}
          </Avatar>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' }}>{params.value}</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>ID: {params.row.id?.slice(0, 8)}</Typography>
          </Box>
        </Box>
      )
    },
    {
      field: 'category', headerName: 'Category', width: 150, renderCell: (params) => (
        <Chip
          label={params.value || 'General'}
          size="small"
          sx={{ fontWeight: 600, backgroundColor: '#f1f5f9', color: '#64748b' }}
        />
      )
    },
    { field: 'mobile', headerName: 'Mobile', width: 150 },
    {
      field: 'party_type', headerName: 'Type', width: 120, renderCell: (params) => (
        <Chip
          label={params.value?.toUpperCase()}
          size="small"
          variant="outlined"
          sx={{
            fontWeight: 800,
            fontSize: '0.65rem',
            color: params.value === 'customer' ? theme.palette.primary.main : '#f59e0b',
            borderColor: params.value === 'customer' ? alpha(theme.palette.primary.main, 0.3) : alpha('#f59e0b', 0.3),
          }}
        />
      )
    },
    {
      field: 'balance',
      headerName: 'Balance',
      width: 180,
      renderCell: (params) => {
        const isCollect = params.row.party_type === 'customer';
        const balance = params.value || 0;
        return (
          <Box>
            <Typography sx={{
              fontWeight: 800,
              color: balance > 0 ? (isCollect ? '#10b981' : '#f43f5e') : '#94a3b8'
            }}>
              ₹{balance.toLocaleString()}
            </Typography>
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
              {balance > 0 ? (isCollect ? 'To Collect' : 'To Pay') : 'Settle'}
            </Typography>
          </Box>
        );
      }
    },
    {
      field: 'is_blocked', headerName: 'Status', width: 120, renderCell: (params) => (
        <Chip
          label={params.value ? 'Blocked' : 'Active'}
          size="small"
          sx={{
            fontWeight: 700,
            backgroundColor: params.value ? '#fee2e2' : '#f0fdf4',
            color: params.value ? '#ef4444' : '#22c55e'
          }}
        />
      )
    },
    {
      field: 'actions',
      headerName: '',
      width: 80,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={(e) => handleMenuOpen(e, params.row)}
          sx={{ color: theme.palette.primary.main }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      )
    }
  ];

  const handleEdit = (party: Party) => {
    setSelectedParty(party);
    setIsDialogOpen(true);
  };


  const parties = data?.data || [];
  const stats = data?.stats || { total_parties: 0, to_collect: 0, to_pay: 0 };

  const selectedPartiesList = React.useMemo(() => {
    return parties.filter((p: any) => 
      selectionModel.type === 'exclude' 
        ? !selectionModel.ids?.has(p.id) 
        : selectionModel.ids?.has(p.id)
    );
  }, [parties, selectionModel]);

  const selectedCount = selectedPartiesList.length;

  return (
    <Box sx={{ p: 0 }}>
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: 2,
        mb: 5
      }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e293b', letterSpacing: '-1.5px', mb: 1, fontSize: { xs: '1.8rem', sm: '2.125rem' } }}>
            Parties Management
          </Typography>
          <Typography sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.9rem' }}>
            Manage your customers and vendors in one unified view.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            sx={{ 
              borderRadius: '12px', 
              fontWeight: 700, 
              textTransform: 'none', 
              px: 3,
              height: '40px',
              whiteSpace: 'nowrap'
            }}
            onClick={() => {
              if (selectedCount === 0) {
                toast.info('Please select at least 1 party to export');
                return;
              }
              handleExport(selectedPartiesList);
            }}
          >
            Export
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            sx={{
              borderRadius: '12px',
              fontWeight: 800,
              textTransform: 'none',
              px: 4,
              height: '40px',
              whiteSpace: 'nowrap',
              boxShadow: '0 8px 20px ' + alpha(theme.palette.primary.main, 0.3)
            }}
            onClick={() => setIsDialogOpen(true)}
          >
            Add Party
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            title="Total Parties"
            value={stats.total_parties || 0}
            icon={<GroupsIcon />}
            color={theme.palette.primary.main}
            subtitle="Active customers & vendors"
            trend="+12%"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            title="To Collect"
            value={`₹${stats.to_collect?.toLocaleString()}`}
            icon={<TrendingUpIcon />}
            color="#10b981"
            subtitle="Receivables from customers"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            title="To Pay"
            value={`₹${stats.to_pay?.toLocaleString()}`}
            icon={<TrendingDownIcon />}
            color="#f43f5e"
            subtitle="Payables to vendors"
          />
        </Grid>
      </Grid>

      <Paper sx={{
        p: 3,
        borderRadius: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
        border: '1px solid #f1f5f9',
        mb: 4
      }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search by name or number..."
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
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={party_typeFilter}
              label="Type"
              onChange={(e) => setPartyTypeFilter(e.target.value)}
              sx={{ borderRadius: '12px' }}
            >
              <MenuItem value="All">All Types</MenuItem>
              <MenuItem value="Customer">Customers</MenuItem>
              <MenuItem value="Vendor">Vendors</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryFilter}
              label="Category"
              onChange={(e) => setCategoryFilter(e.target.value)}
              sx={{ borderRadius: '12px' }}
            >
              <MenuItem value="All">All Categories</MenuItem>
              <MenuItem value="Retail">Retail</MenuItem>
              <MenuItem value="Wholesale">Wholesale</MenuItem>
              <MenuItem value="VIP">VIP</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ flexGrow: 1 }} />

          {selectedCount > 0 && (
            <Stack direction="row" spacing={1} sx={{ p: 1, backgroundColor: '#f1f5f9', borderRadius: '12px' }}>
              <Typography sx={{ alignSelf: 'center', px: 2, fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>
                {selectedCount} selected
              </Typography>



              <Tooltip title="Block selected">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => {
                    triggerConfirm({
                      title: 'Block Selected Parties',
                      message: `Are you sure you want to block the ${selectedCount} selected parties?`,
                      confirmLabel: 'Block',
                      confirmColor: 'error',
                      onConfirm: () => bulkActionMutation.mutate({ action: 'block', ids: selectedPartiesList.map(p => p.id).filter((id): id is string => !!id) })
                    });
                  }}
                >
                  <BlockIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Unblock selected">
                <IconButton
                  size="small"
                  color="success"
                  onClick={() => bulkActionMutation.mutate({ action: 'unblock', ids: selectedPartiesList.map(p => p.id).filter((id): id is string => !!id) })}
                >
                  <CheckCircleIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Delete selected">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => {
                    triggerConfirm({
                      title: 'Permanently Delete Selected Parties',
                      message: `Are you sure you want to permanently delete the ${selectedCount} selected parties? This action cannot be undone.`,
                      confirmLabel: 'Delete',
                      confirmColor: 'error',
                      onConfirm: () => bulkActionMutation.mutate({ action: 'delete', ids: selectedPartiesList.map(p => p.id).filter((id): id is string => !!id) })
                    });
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          )}
        </Box>

        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={parties}
            columns={columns}
            loading={isLoading}
            onRowSelectionModelChange={(newSelectionModel) => setSelectionModel(newSelectionModel)}
            rowSelectionModel={selectionModel}
            checkboxSelection
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
                fontSize: '0.9rem',
                fontWeight: 500,
                color: '#334155'
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.02),
              },
              '& .MuiCheckbox-root': {
                color: '#cbd5e1',
              }
            }}
          />
        </Box>
      </Paper>

      {/* Create/Edit Party Dialog */}
      <QuickAddPartyDialog
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedParty(null);
        }}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['parties'] });
        }}
        editData={selectedParty as Party}
      />

      {/* Row Action Dropdown Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        slotProps={{
          paper: {
            sx: {
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid #f1f5f9',
              minWidth: 150
            }
          }
        }}
      >
        <MenuItem
          onClick={() => {
            if (activeRow) {
              handleEdit(activeRow);
              handleMenuClose();
            }
          }}
          sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#334155' }}
        >
          <EditIcon fontSize="small" sx={{ mr: 1, color: '#94a3b8' }} /> Edit Party
        </MenuItem>



        {activeRow?.is_blocked ? (
          <MenuItem
            onClick={() => {
              if (activeRow && activeRow.id) {
                const rowId = activeRow.id;
                const rowName = activeRow.name;
                const rowData = { ...activeRow, is_blocked: false };
                handleMenuClose();
                triggerConfirm({
                  title: 'Unblock Party',
                  message: `Are you sure you want to unblock "${rowName}"?`,
                  confirmLabel: 'Unblock',
                  confirmColor: 'success',
                  onConfirm: () => updatePartyMutation.mutate({ id: rowId, data: rowData })
                });
              }
            }}
            sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#22c55e' }}
          >
            <CheckCircleIcon fontSize="small" sx={{ mr: 1, color: '#22c55e' }} /> Unblock Party
          </MenuItem>
        ) : (
          <MenuItem
            onClick={() => {
              if (activeRow && activeRow.id) {
                const rowId = activeRow.id;
                const rowName = activeRow.name;
                const rowData = { ...activeRow, is_blocked: true };
                handleMenuClose();
                triggerConfirm({
                  title: 'Block Party',
                  message: `Are you sure you want to block "${rowName}"? This will restrict their transactions.`,
                  confirmLabel: 'Block',
                  confirmColor: 'error',
                  onConfirm: () => updatePartyMutation.mutate({ id: rowId, data: rowData })
                });
              }
            }}
            sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#ef4444' }}
          >
            <BlockIcon fontSize="small" sx={{ mr: 1, color: '#ef4444' }} /> Block Party
          </MenuItem>
        )}

        <MenuItem
          onClick={() => {
            if (activeRow && activeRow.id) {
              const rowId = activeRow.id;
              const rowName = activeRow.name;
              handleMenuClose();
              triggerConfirm({
                title: 'Delete Party',
                message: `Are you sure you want to permanently delete "${rowName}"? This action cannot be undone.`,
                confirmLabel: 'Delete',
                confirmColor: 'error',
                onConfirm: () => deletePartyMutation.mutate(rowId)
              });
            }
          }}
          sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#ef4444' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1, color: '#ef4444' }} /> Delete Party
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
