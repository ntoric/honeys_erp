'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Tooltip,
  useTheme,
  CircularProgress,
  Switch,
  FormControlLabel,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Store as StoreIcon,
} from '@mui/icons-material';
import { db, generateId, Store } from '@/lib/db';
import { toast } from 'sonner';
import { useStore } from '@/context/StoreContext';

export default function StoresPage() {
  const theme = useTheme();
  const { refreshStores } = useStore();
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState<Store[]>([]);
  const [search, setSearch] = useState('');
  const [storeDialogOpen, setStoreDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const allStores = await db.stores.toArray();
      setStores(allStores.filter(s => 
        s.name.toLowerCase().includes(search.toLowerCase()) || 
        (s.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (s.phone || '').includes(search)
      ));
    } catch (error) {
      toast.error('Failed to fetch stores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [search]);

  const handleDeleteStore = async (id: string) => {
    if (id === 'store-default') {
      toast.error('Cannot delete the default store');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this store? All associated data will become inaccessible.')) return;
    try {
      await db.stores.delete(id);
      toast.success('Store deleted');
      fetchStores();
      refreshStores();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e293b', mb: 1 }}>
            Store Management
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 500 }}>
            Create and manage multiple stores. Each store has its own independent data.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => { setEditingStore(null); setStoreDialogOpen(true); }}
          sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, px: 3, boxShadow: '0 8px 16px rgba(76, 59, 207, 0.2)' }}
        >
          Add Store
        </Button>
      </Box>

      <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: 'none' }}>
        <Box sx={{ p: 3, borderBottom: '1px solid #f1f5f9' }}>
          <TextField
            placeholder="Search stores..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: '10px', backgroundColor: '#f8fafc' }
              }
            }}
            sx={{ width: 300 }}
          />
        </Box>
        <TableContainer>
          <Table sx={{ minWidth: 700 }}>
            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Store Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>GSTIN</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}><CircularProgress /></TableCell></TableRow>
              ) : stores.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}>No stores found</TableCell></TableRow>
              ) : stores.map((store) => (
                <TableRow key={store.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 32, height: 32, fontSize: '0.8rem' }}>
                        <StoreIcon fontSize="small" />
                      </Avatar>
                      <Typography sx={{ fontWeight: 700 }}>{store.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: '#64748b' }}>{store.email || '-'}</TableCell>
                  <TableCell sx={{ color: '#64748b' }}>{store.phone || '-'}</TableCell>
                  <TableCell sx={{ color: '#64748b' }}>{store.gstin || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={store.isActive ? 'Active' : 'Inactive'}
                      size="small"
                      color={store.isActive ? 'success' : 'default'}
                      sx={{ fontWeight: 700, borderRadius: '6px' }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => { setEditingStore(store); setStoreDialogOpen(true); }}>
                          <EditIcon fontSize="small" color="primary" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleDeleteStore(store.id)}>
                          <DeleteIcon fontSize="small" color="error" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={storeDialogOpen} onClose={() => setStoreDialogOpen(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: '16px' } } }}>
        <StoreForm
          store={editingStore}
          onClose={() => setStoreDialogOpen(false)}
          onSuccess={() => {
            fetchStores();
            refreshStores();
          }}
        />
      </Dialog>
    </Container>
  );
}

function StoreForm({ store, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    gstin: '',
    isActive: true
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (store) {
      setFormData({
        name: store.name,
        address: store.address || '',
        phone: store.phone || '',
        email: store.email || '',
        gstin: store.gstin || '',
        isActive: store.isActive
      });
    }
  }, [store]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name) newErrors.name = 'Store name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (store) {
        await db.stores.update(store.id, {
          ...formData,
          updatedAt: new Date().toISOString()
        });
        toast.success('Store updated');
      } else {
        await db.stores.add({
          ...formData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        toast.success('Store created');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to save store');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogTitle sx={{ fontWeight: 800 }}>{store ? 'Edit Store' : 'Add New Store'}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        <TextField label="Store Name" fullWidth value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} error={!!errors.name} helperText={errors.name} required />
        <TextField label="Address" fullWidth multiline rows={2} value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField label="Phone Number" fullWidth value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
          <TextField label="Email Address" fullWidth value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
        </Box>
        <TextField label="GSTIN" fullWidth value={formData.gstin} onChange={e => setFormData({ ...formData, gstin: e.target.value })} />
        <FormControlLabel
          control={<Switch checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} />}
          label="Store Active"
        />
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} sx={{ fontWeight: 700, color: '#64748b' }}>Cancel</Button>
        <Button type="submit" variant="contained" sx={{ borderRadius: '10px', fontWeight: 700, px: 3 }}>
          {store ? 'Update Store' : 'Create Store'}
        </Button>
      </DialogActions>
    </form>
  );
}
