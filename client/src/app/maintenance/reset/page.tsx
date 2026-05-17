'use client';

import * as React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Checkbox, 
  FormControlLabel, 
  Button, 
  Divider, 
  Alert, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions,
  Card,
  CardContent,
  FormGroup,
  CircularProgress
} from '@mui/material';
import { db } from '@/lib/db';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { toast } from 'sonner';

const dataCategories = [
  {
    title: 'Sales & Purchases',
    items: [
      { id: 'salesInvoices', label: 'Sales Invoices' },
      { id: 'purchaseInvoices', label: 'Purchase Invoices' },
      { id: 'payments', label: 'Payments (In & Out)' },
      { id: 'suspendedSales', label: 'Suspended Sales (Drafts)' },
    ]
  },
  {
    title: 'Inventory',
    items: [
      { id: 'products', label: 'Products' },
      { id: 'categories', label: 'Categories' },
    ]
  },
  {
    title: 'Parties & Accounts',
    items: [
      { id: 'parties', label: 'Parties (Customers & Vendors)' },
      { id: 'bankAccounts', label: 'Bank Accounts & Cash' },
      { id: 'expenses', label: 'Expenses' },
    ]
  },
  {
    title: 'Staff & Payroll',
    items: [
      { id: 'staff', label: 'Staff Members' },
      { id: 'attendance', label: 'Attendance Records' },
    ]
  },
  {
    title: 'System Logs & Config',
    items: [
      { id: 'auditLogs', label: 'Audit Logs' },
      { id: 'settings', label: 'App Settings' },
    ]
  }
];

export default function SystemResetPage() {
  const [selectedTables, setSelectedTables] = React.useState<Record<string, boolean>>({});
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isResetting, setIsResetting] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const handleToggleTable = (id: string) => {
    setSelectedTables(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSelectCategory = (items: { id: string }[], selected: boolean) => {
    const updates: Record<string, boolean> = {};
    items.forEach(item => {
      updates[item.id] = selected;
    });
    setSelectedTables(prev => ({ ...prev, ...updates }));
  };

  const handleSelectAll = (selected: boolean) => {
    const updates: Record<string, boolean> = {};
    dataCategories.forEach(cat => {
      cat.items.forEach(item => {
        updates[item.id] = selected;
      });
    });
    setSelectedTables(updates);
  };

  const anySelected = Object.values(selectedTables).some(val => val);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      const tablesToClear = Object.keys(selectedTables).filter(key => selectedTables[key]);
      
      if (tablesToClear.length === 0) {
        toast.error('No data categories selected');
        return;
      }

      // We use a transaction for safety
      await db.transaction('rw', tablesToClear, async () => {
        for (const tableName of tablesToClear) {
          await db.table(tableName).clear();
        }
      });
      
      const msg = `Successfully cleared ${tablesToClear.length} data categories. Please refresh the page to see changes.`;
      setSuccessMessage(msg);
      toast.success(msg, { duration: 5000 });
      setSelectedTables({});
      setIsDialogOpen(false);
      
      // Optional: auto-reload after 2 seconds to ensure clean state
      // setTimeout(() => window.location.reload(), 2000);
      
    } catch (error: any) {
      console.error('Failed to reset system:', error);
      toast.error('System reset failed: ' + (error.message || 'Unknown error'));
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', py: 2 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', mb: 1 }}>
            System Reset
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b' }}>
            Selectively clear data from your local database. This action cannot be undone.
          </Typography>
        </Box>
        <RestartAltIcon sx={{ fontSize: 48, color: '#94a3b8', opacity: 0.5 }} />
      </Box>

      {successMessage && (
        <Alert 
          severity="success" 
          sx={{ mb: 3, borderRadius: '12px' }} 
          onClose={() => setSuccessMessage(null)}
          action={
            <Button color="inherit" size="small" onClick={() => window.location.reload()}>
              Refresh Now
            </Button>
          }
        >
          {successMessage}
        </Alert>
      )}

      <Paper sx={{ p: 0, borderRadius: '16px', overflow: 'hidden', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Box sx={{ p: 3, backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#334155' }}>
            Data Categories
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button size="small" onClick={() => handleSelectAll(true)}>Select All</Button>
            <Button size="small" color="inherit" onClick={() => handleSelectAll(false)}>Clear All</Button>
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {dataCategories.map((category) => {
              const allChecked = category.items.every(item => selectedTables[item.id]);
              const someChecked = category.items.some(item => selectedTables[item.id]) && !allChecked;

              return (
                <Grid size={{ xs: 12, md: 6 }} key={category.title}>
                  <Card variant="outlined" sx={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Checkbox 
                          size="small"
                          checked={allChecked}
                          indeterminate={someChecked}
                          onChange={(e) => handleSelectCategory(category.items, e.target.checked)}
                        />
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b' }}>
                          {category.title}
                        </Typography>
                      </Box>
                      <Divider sx={{ mb: 1, opacity: 0.5 }} />
                      <FormGroup sx={{ pl: 1 }}>
                        {category.items.map((item) => (
                          <FormControlLabel
                            key={item.id}
                            control={
                              <Checkbox 
                                size="small" 
                                checked={!!selectedTables[item.id]} 
                                onChange={() => handleToggleTable(item.id)}
                              />
                            }
                            label={
                              <Typography variant="body2" sx={{ color: '#475569' }}>
                                {item.label}
                              </Typography>
                            }
                          />
                        ))}
                      </FormGroup>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="error"
              size="large"
              startIcon={<DeleteForeverIcon />}
              disabled={!anySelected}
              onClick={() => setIsDialogOpen(true)}
              sx={{ 
                borderRadius: '12px', 
                px: 4, 
                py: 1.5,
                fontWeight: 700,
                boxShadow: '0 8px 16px rgba(239, 68, 68, 0.2)',
                '&:hover': {
                  boxShadow: '0 12px 20px rgba(239, 68, 68, 0.3)',
                }
              }}
            >
              Reset Selected Data
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={() => !isResetting && setIsDialogOpen(false)}
        slotProps={{
          paper: {
            sx: { borderRadius: '20px', p: 1, maxWidth: '450px' }
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 800, color: '#ef4444' }}>
          <WarningAmberIcon color="error" />
          Confirm System Reset
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2, fontWeight: 500, color: '#475569' }}>
            You are about to delete the following data permanently:
          </DialogContentText>
          <Box sx={{ 
            backgroundColor: '#fef2f2', 
            p: 2, 
            borderRadius: '12px', 
            border: '1px solid #fee2e2',
            maxHeight: '200px',
            overflowY: 'auto',
            mb: 2
          }}>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#991b1b', fontSize: '0.9rem' }}>
              {Object.keys(selectedTables)
                .filter(key => selectedTables[key])
                .map(key => {
                  const item = dataCategories.flatMap(c => c.items).find(i => i.id === key);
                  return <li key={key} style={{ marginBottom: '4px' }}>{item?.label || key}</li>;
                })
              }
            </ul>
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
            This action cannot be undone. Are you sure you want to proceed?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={() => setIsDialogOpen(false)} 
            disabled={isResetting}
            sx={{ borderRadius: '10px', fontWeight: 600, color: '#64748b' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleReset} 
            variant="contained" 
            color="error"
            disabled={isResetting}
            sx={{ 
              borderRadius: '10px', 
              fontWeight: 700,
              px: 3,
              backgroundColor: '#ef4444',
              '&:hover': { backgroundColor: '#dc2626' }
            }}
          >
            {isResetting ? <CircularProgress size={24} color="inherit" /> : 'Yes, Delete Permanently'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
