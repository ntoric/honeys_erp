'use client';

import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Alert,
} from '@mui/material';
import { PartiesService, Party } from '@/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Validators, validateForm } from '@/lib/validators';

interface QuickAddPartyDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (party: Party) => void;
  initialType?: 'customer' | 'vendor';
  editData?: Party | null;
}

export default function QuickAddPartyDialog({
  open,
  onClose,
  onSuccess,
  initialType = 'customer',
  editData = null,
}: QuickAddPartyDialogProps) {
  const queryClient = useQueryClient();
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [partyType, setPartyType] = React.useState<string>(initialType);
  const [category, setCategory] = React.useState<string>('Retail');

  React.useEffect(() => {
    if (open) {
      setErrorMsg(null);
      setErrors({});
      setPartyType(editData?.party_type || initialType);
      setCategory(editData?.category || 'Retail');
    }
  }, [open, editData, initialType]);

  const handleApiError = (err: any) => {
    const message = err.body?.error || err.message || 'An unexpected error occurred';
    setErrorMsg(message);
    
    if (err.body?.errors) {
      const mappedErrors: Record<string, string> = {};
      for (const [key, val] of Object.entries(err.body.errors)) {
        if (Array.isArray(val) && val.length > 0) {
          mappedErrors[key] = val[0];
        } else if (typeof val === 'string') {
          mappedErrors[key] = val;
        }
      }
      setErrors(mappedErrors);
    }
    toast.error(message);
  };

  const createMutation = useMutation({
    mutationFn: (newParty: Party) => PartiesService.postParties(newParty),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['parties'] });
      queryClient.invalidateQueries({ queryKey: ['parties-search'] });
      toast.success('Party registered successfully');
      onSuccess(data);
      onClose();
    },
    onError: handleApiError
  });

  const updateMutation = useMutation({
    mutationFn: (party: Party) => PartiesService.putParties(party.id!, party),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['parties'] });
      queryClient.invalidateQueries({ queryKey: ['parties-search'] });
      toast.success('Party profile updated successfully');
      onSuccess(data);
      onClose();
    },
    onError: handleApiError
  });

  const isEdit = !!editData;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const partyData: any = {
      ...editData,
      name: formData.get('name'),
      mobile: formData.get('mobile'),
      email: formData.get('email'),
      category: formData.get('category'),
      party_type: formData.get('party_type'),
      balance: parseFloat(formData.get('balance') as string) || 0,
      is_active: editData?.is_active ?? true,
      is_blocked: editData?.is_blocked ?? false,
    };

    // Client-side validations
    const rules = {
      name: [
        Validators.required('Full Name is required'),
        Validators.minLength(3, 'Name must be at least 3 characters'),
        Validators.maxLength(100, 'Name must be at most 100 characters')
      ],
      mobile: [
        Validators.required('Mobile Number is required'),
        Validators.phone('Mobile number must be between 10 to 15 digits')
      ],
      email: [
        Validators.email('Please enter a valid email format')
      ],
      balance: [
        Validators.min(0, 'Opening balance cannot be negative')
      ]
    };

    const formErrors = validateForm(partyData, rules);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      toast.warning('Please correct all validation errors inside the form');
      return;
    }

    setErrors({});
    if (isEdit) {
      updateMutation.mutate(partyData);
    } else {
      createMutation.mutate(partyData);
    }
  };

  const handleFieldChange = (field: string) => {
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: { borderRadius: '24px', p: { xs: 0, sm: 1 }, width: '100%', maxWidth: '600px' },
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 900, fontSize: '1.5rem', letterSpacing: '-0.5px' }}>
          {isEdit ? 'Edit Party' : 'Add New Party'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {errorMsg && (
              <Alert severity="error" sx={{ borderRadius: '12px', fontWeight: 600 }}>
                {errorMsg}
              </Alert>
            )}
            <TextField 
              name="name" 
              label="Full Name" 
              fullWidth 
              required 
              variant="outlined" 
              defaultValue={editData?.name} 
              error={!!errors.name}
              helperText={errors.name}
              onChange={() => handleFieldChange('name')}
            />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField 
                  name="mobile" 
                  label="Mobile Number" 
                  fullWidth 
                  required 
                  defaultValue={editData?.mobile} 
                  error={!!errors.mobile}
                  helperText={errors.mobile}
                  onChange={() => handleFieldChange('mobile')}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField 
                  name="email" 
                  label="Email Address" 
                  fullWidth 
                  type="email" 
                  defaultValue={editData?.email} 
                  error={!!errors.email}
                  helperText={errors.email}
                  onChange={() => handleFieldChange('email')}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Party Type</InputLabel>
                  <Select 
                    name="party_type" 
                    label="Party Type" 
                    value={partyType}
                    onChange={(e) => setPartyType(e.target.value as string)}
                  >
                    <MenuItem value="customer">Customer</MenuItem>
                    <MenuItem value="vendor">Vendor</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select 
                    name="category" 
                    label="Category" 
                    value={category}
                    onChange={(e) => setCategory(e.target.value as string)}
                  >
                    <MenuItem value="Retail">Retail</MenuItem>
                    <MenuItem value="Wholesale">Wholesale</MenuItem>
                    <MenuItem value="VIP">VIP</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <TextField
              name="balance"
              label="Opening Balance"
              fullWidth
              type="number"
              defaultValue={editData?.balance || 0}
              error={!!errors.balance}
              helperText={errors.balance}
              onChange={() => handleFieldChange('balance')}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                },
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} sx={{ fontWeight: 700, color: '#64748b' }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={createMutation.isPending || updateMutation.isPending}
            sx={{ borderRadius: '12px', px: 4, fontWeight: 800 }}
          >
            {createMutation.isPending || updateMutation.isPending ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Party' : 'Create Party')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
