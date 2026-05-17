'use client';

import * as React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Grid, 
  TextField, 
  MenuItem,
  Stack,
  alpha,
  useTheme,
  Autocomplete,
  Divider,
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { PaymentsService, PartiesService, Party } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import PartySelect from '@/components/common/PartySelect';

export default function CreatePaymentOutPage() {
  const theme = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = React.useState({
    party_id: '',
    amount: 0,
    discount: 0,
    payment_date: new Date().toISOString().split('T')[0],
    mode: 'cash',
    payment_no: `POUT-${Date.now().toString().slice(-6)}`,
    notes: '',
    reference_no: ''
  });

  const [selectedParty, setSelectedParty] = React.useState<Party | null>(null);

  const mutation = useMutation({
    mutationFn: (data: any) => PaymentsService.postPayments({
        amount: data.amount,
        discount: data.discount,
        mode: data.mode as any,
        party_id: data.party_id,
        payment_date: data.payment_date,
        payment_no: data.payment_no,
        notes: data.notes,
        reference_no: data.reference_no,
        payment_type: 'pay' as any,
        party_type: 'vendor' as any
    } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments-out'] });
      toast.success('Payment out recorded successfully');
      router.push('/purchase/payments');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to record payment');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.party_id) {
      toast.error('Please select a vendor');
      return;
    }
    if (formData.amount <= 0) {
      toast.error('Amount must be greater than zero');
      return;
    }
    mutation.mutate(formData);
  };

  return (
    <Box sx={{ maxWidth: '900px', mx: 'auto' }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        gap: 2, 
        mb: 4 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton component={Link} href="/purchase/payments" sx={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e293b', letterSpacing: '-1.5px', fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
            Create Payment Out
          </Typography>
        </Box>
      </Box>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 4, borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: '#1e293b' }}>Payment Details</Typography>
              
              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <PartySelect
                    party_type="vendor"
                    value={selectedParty}
                    onChange={(newValue) => {
                      setSelectedParty(newValue);
                      setFormData({ ...formData, party_id: newValue?.id || '' });
                    }}
                    label="Select Party / Vendor"
                    required
                  />
                  {selectedParty && (
                      <Box sx={{ mt: 1, px: 1 }}>
                          <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                              Current Balance: ₹{selectedParty.balance?.toLocaleString() || 0}
                          </Typography>
                      </Box>
                  )}
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Amount Paid"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Payment in Discount"
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Payment Date"
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                    required
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    select
                    fullWidth
                    label="Payment Mode"
                    value={formData.mode}
                    onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                    required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  >
                    <MenuItem value="cash">Cash</MenuItem>
                    <MenuItem value="bank">Bank Transfer</MenuItem>
                    <MenuItem value="upi">UPI</MenuItem>
                    <MenuItem value="cheque">Cheque</MenuItem>
                    <MenuItem value="card">Card</MenuItem>
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Payment Number"
                    value={formData.payment_no}
                    onChange={(e) => setFormData({ ...formData, payment_no: e.target.value })}
                    required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Reference No"
                    value={formData.reference_no}
                    onChange={(e) => setFormData({ ...formData, reference_no: e.target.value })}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Notes"
                    multiline
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={3}>
              <Paper sx={{ p: 4, borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: '#1e293b' }}>Summary</Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography sx={{ color: '#64748b', fontWeight: 500 }}>Amount Paid</Typography>
                  <Typography sx={{ fontWeight: 700 }}>₹{formData.amount.toLocaleString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography sx={{ color: '#64748b', fontWeight: 500 }}>Discount Received</Typography>
                  <Typography sx={{ fontWeight: 700, color: '#10b981' }}>₹{formData.discount.toLocaleString()}</Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>Total Settled</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: theme.palette.primary.main }}>
                    ₹{(formData.amount + formData.discount).toLocaleString()}
                  </Typography>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<SaveIcon />}
                  type="submit"
                  disabled={mutation.isPending}
                  sx={{ 
                    borderRadius: '16px', 
                    fontWeight: 800, 
                    py: 1.5,
                    textTransform: 'none',
                    boxShadow: '0 8px 20px ' + alpha(theme.palette.primary.main, 0.3)
                  }}
                >
                  {mutation.isPending ? 'Saving...' : 'Save Payment'}
                </Button>
                <Button
                  fullWidth
                  variant="text"
                  component={Link}
                  href="/purchase/payments"
                  sx={{ mt: 1, borderRadius: '12px', fontWeight: 700, textTransform: 'none', color: '#64748b' }}
                >
                  Cancel
                </Button>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}
