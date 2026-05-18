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
import { ProductsService, Product } from '@/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Validators, validateForm } from '@/lib/validators';

interface QuickAddProductDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (product: Product) => void;
}

export default function QuickAddProductDialog({
  open,
  onClose,
  onSuccess,
}: QuickAddProductDialogProps) {
  const queryClient = useQueryClient();
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [gstRate, setGstRate] = React.useState<number>(18);
  const [unit, setUnit] = React.useState<string>('pcs');

  React.useEffect(() => {
    if (open) {
      setErrorMsg(null);
      setErrors({});
      setGstRate(18);
      setUnit('pcs');
    }
  }, [open]);

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
    mutationFn: (newProduct: Product) => ProductsService.postProducts(newProduct),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products-search'] });
      toast.success('Product registered successfully');
      onSuccess(data);
      onClose();
    },
    onError: handleApiError
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    
    const salePrice = parseFloat(formData.get('sale_price') as string) || 0;
    const purchasePrice = parseFloat(formData.get('purchase_price') as string) || 0;
    const stockQty = parseFloat(formData.get('stock_quantity') as string) || 0;

    const productData: Product = {
      name: (formData.get('name') as string)?.trim(),
      sku: (formData.get('sku') as string)?.trim() || `SKU-${Date.now().toString().slice(-6)}`,
      sale_price: salePrice,
      purchase_price: purchasePrice,
      gst_rate: gstRate,
      hsn_code: (formData.get('hsn_code') as string)?.trim() || '',
      measuring_unit: unit,
      stock_quantity: stockQty,
      product_type: 'goods',
      enable_batching: false,
      low_stock_warning: false,
      is_active: true,
      track_inventory: true,
    };

    // Client-side validations
    const rules = {
      name: [
        Validators.required('Product Name is required'),
        Validators.minLength(3, 'Name must be at least 3 characters'),
        Validators.maxLength(100, 'Name must be at most 100 characters')
      ],
      sale_price: [
        Validators.required('Sale Price is required'),
        Validators.min(0, 'Sale price cannot be negative')
      ],
      purchase_price: [
        Validators.min(0, 'Purchase price cannot be negative')
      ],
      stock_quantity: [
        Validators.min(0, 'Opening stock cannot be negative')
      ]
    };

    const formErrors = validateForm(productData, rules);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      toast.warning('Please correct all validation errors inside the form');
      return;
    }

    setErrors({});
    createMutation.mutate(productData);
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
          Add New Product / Item
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
              label="Product Name" 
              fullWidth 
              required 
              variant="outlined" 
              error={!!errors.name}
              helperText={errors.name}
              onChange={() => handleFieldChange('name')}
              placeholder="e.g. Diet Coke 300ml"
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField 
                  name="sku" 
                  label="SKU / Barcode" 
                  fullWidth 
                  error={!!errors.sku}
                  helperText={errors.sku || 'Will be auto-generated if left blank'}
                  onChange={() => handleFieldChange('sku')}
                  placeholder="e.g. 89012345"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField 
                  name="hsn_code" 
                  label="HSN / SAC Code" 
                  fullWidth 
                  placeholder="e.g. 2202"
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField 
                  name="sale_price" 
                  label="Sale Price" 
                  fullWidth 
                  required 
                  type="number"
                  error={!!errors.sale_price}
                  helperText={errors.sale_price}
                  onChange={() => handleFieldChange('sale_price')}
                  slotProps={{
                    input: {
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField 
                  name="purchase_price" 
                  label="Purchase Price" 
                  fullWidth 
                  type="number"
                  error={!!errors.purchase_price}
                  helperText={errors.purchase_price}
                  onChange={() => handleFieldChange('purchase_price')}
                  slotProps={{
                    input: {
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    },
                  }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>GST Rate (%)</InputLabel>
                  <Select 
                    name="gst_rate" 
                    label="GST Rate (%)" 
                    value={gstRate}
                    onChange={(e) => setGstRate(Number(e.target.value))}
                  >
                    <MenuItem value={0}>0% (Exempt)</MenuItem>
                    <MenuItem value={5}>5%</MenuItem>
                    <MenuItem value={12}>12%</MenuItem>
                    <MenuItem value={18}>18%</MenuItem>
                    <MenuItem value={28}>28%</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Measuring Unit</InputLabel>
                  <Select 
                    name="measuring_unit" 
                    label="Measuring Unit" 
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as string)}
                  >
                    <MenuItem value="pcs">Pcs (Pieces)</MenuItem>
                    <MenuItem value="box">Box</MenuItem>
                    <MenuItem value="kg">Kg (Kilograms)</MenuItem>
                    <MenuItem value="ltr">Ltr (Liters)</MenuItem>
                    <MenuItem value="mtr">Mtr (Meters)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <TextField
              name="stock_quantity"
              label="Opening Stock Qty"
              fullWidth
              type="number"
              defaultValue={0}
              error={!!errors.stock_quantity}
              helperText={errors.stock_quantity}
              onChange={() => handleFieldChange('stock_quantity')}
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
            disabled={createMutation.isPending}
            sx={{ borderRadius: '12px', px: 4, fontWeight: 800 }}
          >
            {createMutation.isPending ? 'Registering...' : 'Register Product'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
