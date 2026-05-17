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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  Tooltip,
  alpha,
  useTheme,
  CircularProgress,
  Paper,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { db, generateId, Role } from '@/lib/db';
import { toast } from 'sonner';

const PERMISSION_GROUPS = [
  {
    title: 'Dashboard & Reports',
    permissions: [
      { key: 'view_dashboard', label: 'View Dashboard' },
      { key: 'view_reports', label: 'View Reports' },
    ]
  },
  {
    title: 'Sales',
    permissions: [
      { key: 'pos_billing', label: 'POS Billing' },
      { key: 'view_sales', label: 'View Sales' },
      { key: 'manage_sales', label: 'Create/Edit Sales' },
    ]
  },
  {
    title: 'Inventory',
    permissions: [
      { key: 'view_inventory', label: 'View Inventory' },
      { key: 'manage_inventory', label: 'Manage Inventory' },
    ]
  },
  {
    title: 'Staff & Finance',
    permissions: [
      { key: 'view_staff', label: 'View Staff' },
      { key: 'manage_staff', label: 'Manage Staff & Payroll' },
      { key: 'view_accounting', label: 'View Accounting' },
      { key: 'manage_accounting', label: 'Manage Cash & Bank' },
    ]
  },
  {
    title: 'System Administration',
    permissions: [
      { key: 'manage_users', label: 'Manage Users & Roles' },
      { key: 'view_audit_logs', label: 'View Audit Logs' },
      { key: 'view_settings', label: 'View Settings' },
      { key: 'manage_settings', label: 'Change Settings' },
      { key: 'manage_system', label: 'System Maintenance' },
      { key: 'all', label: 'Full Access (Super Admin)' },
    ]
  }
];

export default function RolesPage() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<Role[]>([]);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const allRoles = await db.roles.toArray();
      setRoles(allRoles);
    } catch (error) {
      toast.error('Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleDeleteRole = async (id: string) => {
    if (id === 'role-system-admin') {
      toast.error('Cannot delete the System Administrator role');
      return;
    }
    // Check if role is in use
    const usersWithRole = await db.users.where('roleId').equals(id).count();
    if (usersWithRole > 0) {
      toast.error(`Cannot delete role. It is assigned to ${usersWithRole} user(s).`);
      return;
    }

    if (!window.confirm('Are you sure you want to delete this role?')) return;
    try {
      await db.roles.delete(id);
      toast.success('Role deleted');
      fetchRoles();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e293b', mb: 1 }}>
            Roles & Permissions
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 500 }}>
            Define access levels and permissions for different user roles.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => { setEditingRole(null); setRoleDialogOpen(true); }}
          sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, px: 3, boxShadow: '0 8px 16px rgba(76, 59, 207, 0.2)' }}
        >
          Add Role
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: '#475569' }}>Available Roles</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {loading ? <CircularProgress /> : roles.map((role) => (
              <Card 
                key={role.id} 
                sx={{ 
                  p: 2, 
                  cursor: 'pointer', 
                  border: editingRole?.id === role.id ? `2px solid ${theme.palette.primary.main}` : '1px solid #f1f5f9',
                  boxShadow: editingRole?.id === role.id ? '0 8px 20px rgba(76, 59, 207, 0.1)' : '0 2px 4px rgba(0,0,0,0.02)',
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 20px rgba(0,0,0,0.05)' }
                }}
                onClick={() => setEditingRole(role)}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <SecurityIcon sx={{ color: role.id === 'role-system-admin' ? theme.palette.secondary.main : theme.palette.primary.main }} />
                    <Typography sx={{ fontWeight: 800, color: '#1e293b' }}>{role.name}</Typography>
                  </Box>
                  <Box>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); setEditingRole(role); setRoleDialogOpen(true); }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    {role.id !== 'role-system-admin' && (
                      <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDeleteRole(role.id); }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </Box>
                <Typography variant="caption" sx={{ color: '#64748b', mt: 1, display: 'block', fontWeight: 600 }}>
                  {role.permissions.length} Permissions assigned
                </Typography>
              </Card>
            ))}
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          {editingRole ? (
            <Card sx={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <Box sx={{ p: 3, borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b' }}>
                    Permissions for: {editingRole.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                    Select the features this role can access.
                  </Typography>
                </Box>
                <Button 
                  variant="contained" 
                  size="small" 
                  onClick={() => handleUpdatePermissions(editingRole)}
                  sx={{ borderRadius: '8px', fontWeight: 700 }}
                >
                  Save Changes
                </Button>
              </Box>
              <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  {PERMISSION_GROUPS.map((group) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={group.title}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: theme.palette.primary.main, mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {group.title}
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {group.permissions.map((perm) => (
                          <FormControlLabel
                            key={perm.key}
                            control={
                              <Checkbox
                                size="small"
                                checked={editingRole.permissions.includes(perm.key) || editingRole.permissions.includes('all')}
                                disabled={editingRole.id === 'role-system-admin' || (editingRole.permissions.includes('all') && perm.key !== 'all')}
                                onChange={(e) => handlePermissionChange(perm.key, e.target.checked)}
                              />
                            }
                            label={<Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>{perm.label}</Typography>}
                          />
                        ))}
                      </Box>
                      <Divider sx={{ mt: 2 }} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Card>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', p: 4, backgroundColor: alpha(theme.palette.primary.main, 0.05), borderRadius: '16px', border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}` }}>
              <SecurityIcon sx={{ fontSize: 64, color: alpha(theme.palette.primary.main, 0.2), mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#64748b', fontWeight: 700 }}>Select a role to view and edit permissions</Typography>
            </Box>
          )}
        </Grid>
      </Grid>

      {/* Role Dialog */}
      <Dialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: '16px' } } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>{editingRole ? 'Edit Role' : 'Add New Role'}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            autoFocus
            label="Role Name"
            fullWidth
            value={editingRole?.name || ''}
            onChange={(e) => setEditingRole(prev => prev ? ({ ...prev, name: e.target.value }) : ({ id: '', name: e.target.value, permissions: [] }))}
            placeholder="e.g. Sales Manager"
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setRoleDialogOpen(false)} sx={{ fontWeight: 700, color: '#64748b' }}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveRole}
            sx={{ borderRadius: '10px', fontWeight: 700, px: 3 }}
          >
            {editingRole?.id ? 'Update Role' : 'Create Role'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );

  function handlePermissionChange(permKey: string, checked: boolean) {
    if (!editingRole) return;
    
    let newPermissions = [...editingRole.permissions];
    if (checked) {
      if (permKey === 'all') {
        newPermissions = ['all'];
      } else {
        newPermissions.push(permKey);
      }
    } else {
      newPermissions = newPermissions.filter(p => p !== permKey);
    }
    
    setEditingRole({ ...editingRole, permissions: newPermissions });
  }

  async function handleUpdatePermissions(role: Role) {
    try {
      await db.roles.update(role.id, { permissions: role.permissions });
      toast.success('Permissions updated successfully');
      fetchRoles();
    } catch (error) {
      toast.error('Failed to update permissions');
    }
  }

  async function handleSaveRole() {
    if (!editingRole?.name) {
      toast.error('Role name is required');
      return;
    }
    
    try {
      if (editingRole.id) {
        await db.roles.update(editingRole.id, { name: editingRole.name });
        toast.success('Role updated');
      } else {
        const id = 'role-' + generateId();
        await db.roles.add({
          id,
          name: editingRole.name,
          permissions: []
        });
        toast.success('Role created');
      }
      setRoleDialogOpen(false);
      fetchRoles();
    } catch (error) {
      toast.error('Failed to save role');
    }
  }
}
