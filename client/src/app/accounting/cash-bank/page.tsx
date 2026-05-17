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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Card,
  CardContent,
  Tab,
  Tabs
} from '@mui/material';
import StatCard from '@/components/common/StatCard';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PaymentsIcon from '@mui/icons-material/Payments';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OpenAPI } from '@/api';
import { toast } from 'sonner';

// Custom API calls since these aren't in the generated service yet
const fetchAccounts = async () => {
  const res = await fetch(`${OpenAPI.BASE}/accounting/cash-bank/accounts`);
  if (!res.ok) throw new Error('Failed to fetch accounts');
  return res.json();
};

const fetchTransactions = async (params: { from_date?: string; to_date?: string } = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${OpenAPI.BASE}/accounting/cash-bank/transactions?${query}`);
  if (!res.ok) throw new Error('Failed to fetch transactions');
  return res.json();
};

const fetchSummary = async () => {
  const res = await fetch(`${OpenAPI.BASE}/accounting/cash-bank/summary`);
  if (!res.ok) throw new Error('Failed to fetch summary');
  return res.json();
};

export default function CashBankPage() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = React.useState(0);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [dateFilter, setDateFilter] = React.useState('All');
  
  // Dialog States
  const [accountDialogOpen, setAccountDialogOpen] = React.useState(false);
  const [movementDialogOpen, setMovementDialogOpen] = React.useState(false);
  const [editingAccount, setEditingAccount] = React.useState<any>(null);
  const [movementType, setMovementType] = React.useState<'add' | 'reduce' | 'transfer'>('add');

  // Queries
  const { data: accounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ['cb-accounts'],
    queryFn: fetchAccounts
  });

  const { data: transactions = [], isLoading: txsLoading } = useQuery({
    queryKey: ['cb-transactions', dateFilter],
    queryFn: () => {
      let from_date, to_date;
      if (dateFilter === 'Today') {
        from_date = to_date = new Date().toISOString().split('T')[0];
      } else if (dateFilter === 'This Month') {
        const d = new Date();
        from_date = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
        to_date = d.toISOString().split('T')[0];
      }
      return fetchTransactions({ from_date, to_date });
    }
  });

  const { data: summary = { total_balance: 0, cash_balance: 0, bank_balance: 0 } } = useQuery({
    queryKey: ['cb-summary'],
    queryFn: fetchSummary
  });

  // Mutations
  const accountMutation = useMutation({
    mutationFn: async (data: any) => {
      const method = editingAccount ? 'PUT' : 'POST';
      const url = editingAccount 
        ? `${OpenAPI.BASE}/accounting/cash-bank/accounts/${editingAccount.id}` 
        : `${OpenAPI.BASE}/accounting/cash-bank/accounts`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cb-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['cb-summary'] });
      setAccountDialogOpen(false);
      setEditingAccount(null);
      toast.success(editingAccount ? 'Account updated' : 'Account created');
    }
  });

  const movementMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${OpenAPI.BASE}/accounting/cash-bank/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cb-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['cb-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['cb-summary'] });
      setMovementDialogOpen(false);
      toast.success('Transaction successful');
    }
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`${OpenAPI.BASE}/accounting/cash-bank/accounts/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cb-accounts'] });
      toast.success('Account deactivated');
    }
  });

  const handleAddAccount = () => {
    setEditingAccount(null);
    setAccountDialogOpen(true);
  };

  const handleEditAccount = (acc: any) => {
    setEditingAccount(acc);
    setAccountDialogOpen(true);
  };

  const handleMovement = (type: 'add' | 'reduce' | 'transfer') => {
    setMovementType(type);
    setMovementDialogOpen(true);
  };

  const columns: GridColDef[] = [
    { field: 'date', headerName: 'Date', width: 120 },
    { field: 'type', headerName: 'Type', width: 120, renderCell: (params) => (
      <Chip 
        label={params.value.toUpperCase()} 
        size="small" 
        color={params.value === 'deposit' || params.value === 'add' ? 'success' : params.value === 'withdraw' || params.value === 'reduce' ? 'error' : 'primary'}
        sx={{ fontWeight: 700, fontSize: '0.65rem' }}
      />
    )},
    { field: 'from_account_name', headerName: 'From', width: 180, valueGetter: (params, row) => row.from_account_name || '-' },
    { field: 'to_account_name', headerName: 'To', width: 180, valueGetter: (params, row) => row.to_account_name || '-' },
    { field: 'amount', headerName: 'Amount', width: 150, renderCell: (params) => (
      <Typography sx={{ fontWeight: 800 }}>₹{params.value.toLocaleString()}</Typography>
    )},
    { field: 'reference_no', headerName: 'Reference', width: 150 },
    { field: 'notes', headerName: 'Notes', flex: 1 },
  ];

  const cashAccount = accounts.find((a: any) => a.is_cash);
  const bankAccounts = accounts.filter((a: any) => !a.is_cash && a.is_active);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e293b', letterSpacing: '-1.5px', mb: 1 }}>
            Cash & Bank
          </Typography>
          <Typography sx={{ color: '#64748b', fontWeight: 500 }}>
            Manage your cash-in-hand and bank account balances.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            sx={{ borderRadius: '12px', fontWeight: 700, textTransform: 'none', px: 3 }}
            onClick={() => {
              // Simple CSV Export mock
              const csvContent = "data:text/csv;charset=utf-8," 
                + transactions.map((t: any) => `${t.date},${t.type},${t.amount},${t.reference_no}`).join("\n");
              const encodedUri = encodeURI(csvContent);
              window.open(encodedUri);
            }}
          >
            Export Transactions
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddAccount}
            sx={{ 
              borderRadius: '12px', 
              fontWeight: 800, 
              textTransform: 'none', 
              px: 4,
              boxShadow: '0 8px 20px ' + alpha(theme.palette.primary.main, 0.3)
            }}
          >
            Add New Bank Account
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard 
            title="Total Balance" 
            value={`₹${summary.total_balance?.toLocaleString()}`} 
            icon={<AccountBalanceWalletIcon />} 
            color={theme.palette.primary.main} 
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard 
            title="Cash in-hand" 
            value={`₹${summary.cash_balance?.toLocaleString()}`} 
            icon={<PaymentsIcon />} 
            color="#10b981" 
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard 
            title="Bank Balance" 
            value={`₹${summary.bank_balance?.toLocaleString()}`} 
            icon={<AccountBalanceIcon />} 
            color="#3b82f6" 
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 5 }}>
        {/* Cash Section */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: '24px', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PaymentsIcon color="success" /> Cash Section
              </Typography>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: alpha('#10b981', 0.05), borderRadius: '16px', mb: 3 }}>
                <Typography sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>Cash Balance</Typography>
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#059669' }}>₹{cashAccount?.balance?.toLocaleString() || 0}</Typography>
              </Paper>
              <Stack spacing={1.5}>
                <Button 
                  fullWidth 
                  variant="contained" 
                  color="success" 
                  startIcon={<AddIcon />}
                  onClick={() => handleMovement('add')}
                  sx={{ borderRadius: '12px', py: 1.2, fontWeight: 700 }}
                >
                  Add Money
                </Button>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  color="error" 
                  startIcon={<RemoveIcon />}
                  onClick={() => handleMovement('reduce')}
                  sx={{ borderRadius: '12px', py: 1.2, fontWeight: 700 }}
                >
                  Reduce Money
                </Button>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  color="primary" 
                  startIcon={<SwapHorizIcon />}
                  onClick={() => handleMovement('transfer')}
                  sx={{ borderRadius: '12px', py: 1.2, fontWeight: 700 }}
                >
                  Transfer Money
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Bank Accounts Section */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ borderRadius: '24px', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccountBalanceIcon color="primary" /> Bank Accounts
              </Typography>
              
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#94a3b8', mb: 2, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '1px' }}>
                  Unlinked Transactions
                </Typography>
                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: '16px', border: '1px dashed #e2e8f0' }}>
                  <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>No unlinked transactions found. Link your bank to auto-sync.</Typography>
                  <Button size="small" sx={{ mt: 1, fontWeight: 700 }}>Connect Bank</Button>
                </Paper>
              </Box>

              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#94a3b8', mb: 2, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '1px' }}>
                Your Accounts
              </Typography>
              
              {bankAccounts.length === 0 ? (
                <Box sx={{ py: 8, textAlign: 'center' }}>
                  <Typography color="text.secondary">No bank accounts added yet.</Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {bankAccounts.map((acc: any) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={acc.id}>
                      <Paper sx={{ 
                        p: 2, 
                        borderRadius: '16px', 
                        border: '1px solid #f1f5f9',
                        '&:hover': { borderColor: theme.palette.primary.main, bgcolor: alpha(theme.palette.primary.main, 0.01) }
                      }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography sx={{ fontWeight: 800 }}>{acc.account_name}</Typography>
                          <Box>
                            <IconButton size="small" onClick={() => handleEditAccount(acc)}><EditIcon fontSize="small" /></IconButton>
                            <IconButton size="small" color="error" onClick={() => deleteAccountMutation.mutate(acc.id)}><DeleteIcon fontSize="small" /></IconButton>
                          </Box>
                        </Box>
                        <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mb: 1 }}>{acc.bank_name} • {acc.account_number}</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 900 }}>₹{acc.balance?.toLocaleString()}</Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Transactions Section */}
      <Paper sx={{ 
        p: 3, 
        borderRadius: '24px', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)', 
        border: '1px solid #f1f5f9',
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Transaction History</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              size="small"
              placeholder="Search reference, notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
                }
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
            />
            <TextField
              select
              size="small"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              sx={{ minWidth: 150, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
            >
              <MenuItem value="All">All Time</MenuItem>
              <MenuItem value="Today">Today</MenuItem>
              <MenuItem value="This Month">This Month</MenuItem>
            </TextField>
          </Box>
        </Box>

        <Box sx={{ height: 500, width: '100%' }}>
          <DataGrid
            rows={transactions.filter((t: any) => 
              t.reference_no?.toLowerCase().includes(searchTerm.toLowerCase()) || 
              t.notes?.toLowerCase().includes(searchTerm.toLowerCase())
            )}
            columns={columns}
            loading={txsLoading}
            getRowId={(row) => row.id}
            sx={{
              border: 'none',
              '& .MuiDataGrid-columnHeader': { bgcolor: '#f8fafc', fontWeight: 800 },
              '& .MuiDataGrid-cell': { borderBottom: '1px solid #f1f5f9' },
            }}
          />
        </Box>
      </Paper>

      {/* Account Dialog */}
      <Dialog open={accountDialogOpen} onClose={() => setAccountDialogOpen(false)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: '20px' } } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>{editingAccount ? 'Edit Account' : 'Add New Bank Account'}</DialogTitle>
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const data = Object.fromEntries(formData);
          accountMutation.mutate({
            ...data,
            opening_balance: parseFloat(data.opening_balance as string) || 0,
            is_cash: false
          });
        }}>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField name="account_name" label="Account Display Name" defaultValue={editingAccount?.account_name} fullWidth required />
              <TextField name="bank_name" label="Bank Name" defaultValue={editingAccount?.bank_name} fullWidth required />
              <TextField name="account_number" label="Account Number" defaultValue={editingAccount?.account_number} fullWidth required />
              <TextField name="ifsc_code" label="IFSC Code" defaultValue={editingAccount?.ifsc_code} fullWidth />
              <TextField name="branch" label="Branch Name" defaultValue={editingAccount?.branch} fullWidth />
              {!editingAccount && <TextField name="opening_balance" label="Opening Balance" type="number" fullWidth required />}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setAccountDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" loading={accountMutation.isPending}>Save Account</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Movement Dialog */}
      <Dialog open={movementDialogOpen} onClose={() => setMovementDialogOpen(false)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: '20px' } } }}>
        <DialogTitle sx={{ fontWeight: 800, textTransform: 'capitalize' }}>{movementType} Money</DialogTitle>
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const data = Object.fromEntries(formData);
          movementMutation.mutate({
            ...data,
            type: movementType,
            amount: parseFloat(data.amount as string),
            date: new Date().toISOString().split('T')[0],
            from_account_id: data.from_account_id || null,
            to_account_id: data.to_account_id || null,
          });
        }}>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              {movementType === 'transfer' && (
                <TextField select name="from_account_id" label="From Account" fullWidth required>
                  {accounts.map((a: any) => <MenuItem key={a.id} value={a.id}>{a.account_name} (₹{a.balance})</MenuItem>)}
                </TextField>
              )}
              {movementType === 'reduce' && (
                <TextField select name="from_account_id" label="From Account" fullWidth required>
                  {accounts.map((a: any) => <MenuItem key={a.id} value={a.id}>{a.account_name} (₹{a.balance})</MenuItem>)}
                </TextField>
              )}
              {(movementType === 'add' || movementType === 'transfer') && (
                <TextField select name="to_account_id" label="To Account" fullWidth required>
                  {accounts.map((a: any) => <MenuItem key={a.id} value={a.id}>{a.account_name} (₹{a.balance})</MenuItem>)}
                </TextField>
              )}
              <TextField name="amount" label="Amount" type="number" fullWidth required />
              <TextField name="reference_no" label="Reference No" fullWidth />
              <TextField name="notes" label="Notes" multiline rows={2} fullWidth />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setMovementDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color={movementType === 'reduce' ? 'error' : movementType === 'add' ? 'success' : 'primary'} loading={movementMutation.isPending}>
              Confirm {movementType}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
