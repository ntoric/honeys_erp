'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  Container,
  Grid,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Tooltip,
  alpha,
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
  Person as PersonIcon,
  VpnKey as VpnKeyIcon,
  ContentCopy as ContentCopyIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { db, generateId, User, Role } from '@/lib/db';
import { hashPassword } from '@/lib/hash';
import { toast } from 'sonner';

export default function UsersPage() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [search, setSearch] = useState('');
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [tempPassword, setTempPassword] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const allUsers = await db.users.toArray();
      const allRoles = await db.roles.toArray();
      setRoles(allRoles);
      
      const usersWithRoles = allUsers.map(u => ({
        ...u,
        roleName: allRoles.find(r => r.id === u.roleId)?.name || 'Unknown'
      }));
      
      setUsers(usersWithRoles.filter(u => 
        u.name.toLowerCase().includes(search.toLowerCase()) || 
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.username.toLowerCase().includes(search.toLowerCase())
      ));
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const handleDeleteUser = async (id: string) => {
    if (id === 'user-admin') {
      toast.error('Cannot delete the main administrator');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await db.users.delete(id);
      toast.success('User deleted');
      fetchData();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const handleResetPassword = async (user: any) => {
    const newTempPassword = Math.random().toString(36).substring(2, 10);
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24);
    
    try {
      await db.users.update(user.id, {
        tempPassword: newTempPassword,
        tempPasswordExpiry: expiry.toISOString(),
        mustChangePassword: true
      });
      setTempPassword(newTempPassword);
      setResetPasswordDialogOpen(true);
      fetchData();
    } catch (error) {
      toast.error('Failed to reset password');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e293b', mb: 1 }}>
            User Management
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 500 }}>
            Create and manage system users and their access levels.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => { setEditingUser(null); setTempPassword(''); setUserDialogOpen(true); }}
          sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, px: 3, boxShadow: '0 8px 16px rgba(76, 59, 207, 0.2)' }}
        >
          Add User
        </Button>
      </Box>

      <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: 'none' }}>
        <Box sx={{ p: 3, borderBottom: '1px solid #f1f5f9' }}>
          <TextField
            placeholder="Search users..."
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
                <TableCell sx={{ fontWeight: 700 }}>User Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Username</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Store</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}><CircularProgress /></TableCell></TableRow>
              ) : users.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}>No users found</TableCell></TableRow>
              ) : users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 32, height: 32, fontSize: '0.8rem' }}>
                        {user.name[0]}
                      </Avatar>
                      <Typography sx={{ fontWeight: 700 }}>{user.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{user.username}</TableCell>
                  <TableCell sx={{ color: '#64748b' }}>{user.email}</TableCell>
                  <TableCell>
                    <Chip label={user.roleName} size="small" sx={{ fontWeight: 700, borderRadius: '6px' }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b' }}>
                      {user.storeName || 'Global'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.isActive ? 'Active' : 'Inactive'}
                      size="small"
                      color={user.isActive ? 'success' : 'default'}
                      sx={{ fontWeight: 700, borderRadius: '6px' }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <Tooltip title="Reset Password">
                        <IconButton size="small" onClick={() => handleResetPassword(user)}>
                          <RefreshIcon fontSize="small" color="primary" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => { setEditingUser(user); setUserDialogOpen(true); }}>
                          <EditIcon fontSize="small" color="primary" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleDeleteUser(user.id)}>
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

      {/* User Dialog */}
      <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: '16px' } } }}>
        <UserForm
          user={editingUser}
          roles={roles}
          onClose={() => setUserDialogOpen(false)}
          onSuccess={(pass?: string) => {
            fetchData();
            if (pass) {
              setTempPassword(pass);
              setResetPasswordDialogOpen(true);
            }
          }}
        />
      </Dialog>

      {/* Password Display Dialog */}
      <Dialog open={resetPasswordDialogOpen} onClose={() => setResetPasswordDialogOpen(false)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: '16px' } } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Temporary Password</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2, textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '12px', border: '2px dashed #e2e8f0' }}>
            <Typography variant="h4" sx={{ fontWeight: 900, color: theme.palette.primary.main, mb: 1, letterSpacing: '2px' }}>
              {tempPassword}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
              This password is valid for 24 hours only.
            </Typography>
            <Button
              startIcon={<ContentCopyIcon />}
              onClick={() => copyToClipboard(tempPassword)}
              sx={{ mt: 2, fontWeight: 700 }}
            >
              Copy Password
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setResetPasswordDialogOpen(false)} variant="contained" fullWidth sx={{ borderRadius: '10px', fontWeight: 700 }}>
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

function UserForm({ user, roles, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    roleId: '',
    storeId: '',
    isActive: true
  });
  const [stores, setStores] = useState<any[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchStores = async () => {
      const allStores = await db.stores.toArray();
      setStores(allStores);
    };
    fetchStores();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        username: user.username || '',
        email: user.email,
        phone: user.phone,
        roleId: user.roleId,
        storeId: user.storeId || '',
        isActive: user.isActive
      });
    }
  }, [user]);

  const isStoreRequired = formData.roleId !== 'role-system-admin';

  const validate = async () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.roleId) newErrors.roleId = 'Role is required';
    if (isStoreRequired && !formData.storeId) newErrors.storeId = 'Store is required';

    // Check if username/email already exists (except for current user)
    const trimmedUsername = formData.username.trim();
    const trimmedEmail = formData.email.trim();

    const existingUsername = await db.users.where('username').equals(trimmedUsername).first();
    if (existingUsername && existingUsername.id !== user?.id) {
      newErrors.username = 'Username already taken';
    }

    const existingEmail = await db.users.where('email').equals(trimmedEmail).first();
    if (existingEmail && existingEmail.id !== user?.id) {
      newErrors.email = 'Email already registered';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!(await validate())) return;

    try {
      const userToSave = {
        ...formData,
        username: formData.username.trim(),
        email: formData.email.trim(),
      };

      if (user) {
        await db.users.update(user.id, userToSave);
        onSuccess();
        onClose();
        toast.success('User updated');
      } else {
        const id = generateId();
        const tempPassword = Math.random().toString(36).substring(2, 10);
        const hashedTempPassword = await hashPassword(tempPassword);
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 24);
        
        await db.users.add({
          ...userToSave,
          id,
          tempPassword: hashedTempPassword,
          tempPasswordExpiry: expiry.toISOString(),
          mustChangePassword: true
        });
        onSuccess(tempPassword); // Pass plain text to show to admin
        onClose();
        toast.success('User created');
      }
    } catch (error) {
      toast.error('Failed to save user');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogTitle sx={{ fontWeight: 800 }}>{user ? 'Edit User' : 'Add New User'}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        <TextField label="Full Name" fullWidth value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} error={!!errors.name} helperText={errors.name} required />
        <TextField label="Username" fullWidth value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} error={!!errors.username} helperText={errors.username} required />
        <TextField label="Email Address" fullWidth value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} error={!!errors.email} helperText={errors.email} required />
        <TextField label="Phone Number" fullWidth value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
        <FormControl fullWidth required error={!!errors.roleId}>
          <InputLabel>Role</InputLabel>
          <Select label="Role" value={formData.roleId} onChange={e => setFormData({ ...formData, roleId: e.target.value })}>
            {roles.map((r: Role) => (
              <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
            ))}
          </Select>
          {errors.roleId && <Typography variant="caption" color="error" sx={{ ml: 1.5, mt: 0.5 }}>{errors.roleId}</Typography>}
        </FormControl>

        {isStoreRequired && (
          <FormControl fullWidth required error={!!errors.storeId}>
            <InputLabel>Assign to Store</InputLabel>
            <Select label="Assign to Store" value={formData.storeId} onChange={e => setFormData({ ...formData, storeId: e.target.value })}>
              {stores.map((s: any) => (
                <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
              ))}
            </Select>
            {errors.storeId && <Typography variant="caption" color="error" sx={{ ml: 1.5, mt: 0.5 }}>{errors.storeId}</Typography>}
          </FormControl>
        )}
        <FormControlLabel
          control={<Switch checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} />}
          label="Account Active"
        />
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} sx={{ fontWeight: 700, color: '#64748b' }}>Cancel</Button>
        <Button type="submit" variant="contained" sx={{ borderRadius: '10px', fontWeight: 700, px: 3 }}>
          {user ? 'Update User' : 'Create User'}
        </Button>
      </DialogActions>
    </form>
  );
}
