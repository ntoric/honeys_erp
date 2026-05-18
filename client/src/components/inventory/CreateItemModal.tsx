'use client';

import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Typography,
  Box,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  InputAdornment,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  QrCodeScanner as BarcodeIcon,
  Search as SearchIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { Product } from '@/api/models/Product';
import { CategoriesService } from '@/api/services/CategoriesService';
import { Category } from '@/api/models/Category';

interface CreateItemModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  initialData?: Product | null;
}

export default function CreateItemModal({
  open,
  onClose,
  onSave,
  initialData,
}: CreateItemModalProps) {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [hasExpiry, setHasExpiry] = React.useState(false);
  const [formData, setFormData] = React.useState<Product>({
    product_type: 'Product',
    name: '',
    category_id: '',
    enable_batching: false,
    item_code: '',
    hsn_code: '',
    measuring_unit: 'Pcs',
    stock_quantity: 0,
    low_stock_warning: true,
    low_stock_quantity: 10,
    sale_price: 0,
    wholesale_price: 0,
    sale_price_tax_inclusive: true,
    purchase_price: 0,
    purchase_price_tax_inclusive: true,
    gst_rate: 18,
    discount_on_sale: 0,
    is_draft: false,
  });
  const fetchCategories = React.useCallback(async () => {
    try {
      const response = await CategoriesService.getCategories();
      setCategories(response as any);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  }, []);

  React.useEffect(() => {
    if (open) {
      Promise.resolve().then(() => {
        fetchCategories();
        if (initialData) {
          setFormData({
            ...initialData,
            wholesale_price: (initialData as any).wholesale_price || (initialData as any).wholesalePrice || 0
          });
          setHasExpiry(!!initialData.expiry_date);
        } else {
          setFormData({
            product_type: 'Product',
            name: '',
            category_id: '',
            enable_batching: false,
            item_code: '',
            hsn_code: '',
            measuring_unit: 'Pcs',
            stock_quantity: 0,
            low_stock_warning: true,
            low_stock_quantity: 10,
            sale_price: 0,
            wholesale_price: 0,
            sale_price_tax_inclusive: true,
            purchase_price: 0,
            purchase_price_tax_inclusive: true,
            gst_rate: 18,
            discount_on_sale: 0,
            is_draft: false,
          });
          setHasExpiry(false);
        }
      });
    }
  }, [open, initialData, fetchCategories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleTypeChange = (_: any, newType: string) => {
    if (newType !== null) {
      setFormData((prev) => ({ ...prev, product_type: newType }));
    }
  };

  const handleGenerateBarcode = () => {
    const randomCode = '890' + Math.floor(Math.random() * 1000000000).toString().padStart(10, '0');
    setFormData((prev) => ({ ...prev, item_code: randomCode }));
  };

  const handleSubmit = (isDraft: boolean) => {
    onSave({ ...formData, is_draft: isDraft });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography component="span" variant="h6" sx={{ fontWeight: 800 }}>
          {initialData ? 'Edit Item' : 'Create New Item'}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ backgroundColor: '#fcfcfd' }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#64748b', textTransform: 'uppercase' }}>
            Basic Details
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <ToggleButtonGroup
                value={formData.product_type}
                exclusive
                onChange={handleTypeChange}
                size="small"
                sx={{ mb: 1 }}
              >
                <ToggleButton value="Product" sx={{ px: 3, fontWeight: 700 }}>Product</ToggleButton>
                <ToggleButton value="Service" sx={{ px: 3, fontWeight: 700 }}>Service</ToggleButton>
              </ToggleButtonGroup>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Select Category"
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                variant="outlined"
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Item Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={<Switch name="enable_batching" checked={formData.enable_batching} onChange={handleChange} />}
                label={<Typography sx={{ fontWeight: 600 }}>Enable Batching / Serial Number Tracking</Typography>}
              />
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ mb: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#64748b', textTransform: 'uppercase' }}>
            Stock Details
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Item Code / SKU"
                name="item_code"
                value={formData.item_code}
                onChange={handleChange}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title="Generate Barcode">
                          <IconButton onClick={handleGenerateBarcode} edge="end">
                            <BarcodeIcon />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="HSN Code"
                name="hsn_code"
                value={formData.hsn_code}
                onChange={handleChange}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title="Find HSN Code">
                          <IconButton size="small">
                            <SearchIcon />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                fullWidth
                label="Measuring Unit"
                name="measuring_unit"
                value={formData.measuring_unit}
                onChange={handleChange}
              >
                <MenuItem value="Pcs">Pcs</MenuItem>
                <MenuItem value="Kg">Kg</MenuItem>
                <MenuItem value="Ltr">Ltr</MenuItem>
                <MenuItem value="Mtr">Mtr</MenuItem>
                <MenuItem value="Box">Box</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                type="number"
                label="Opening Stock"
                name="stock_quantity"
                value={formData.stock_quantity}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                type="date"
                label="As of Date"
                slotProps={{ inputLabel: { shrink: true } }}
                defaultValue={new Date().toISOString().split('T')[0]}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={<Switch name="low_stock_warning" checked={formData.low_stock_warning} onChange={handleChange} />}
                label={<Typography sx={{ fontWeight: 600 }}>Low Stock Warning</Typography>}
              />
            </Grid>
            {formData.low_stock_warning && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Low Stock Quantity"
                  name="low_stock_quantity"
                  value={formData.low_stock_quantity}
                  onChange={handleChange}
                />
              </Grid>
            )}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Switch 
                    name="has_expiry" 
                    checked={hasExpiry} 
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setHasExpiry(checked);
                      if (!checked) {
                        setFormData(prev => ({ ...prev, expiry_date: undefined }));
                      }
                    }} 
                  />
                }
                label={<Typography sx={{ fontWeight: 600 }}>Has Expiry</Typography>}
              />
            </Grid>
            {hasExpiry && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Expiry Date"
                  name="expiry_date"
                  value={formData.expiry_date || ''}
                  onChange={handleChange}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
            )}
          </Grid>
        </Box>

        <Divider sx={{ mb: 4 }} />

        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#64748b', textTransform: 'uppercase' }}>
            Pricing Details
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Sale Price"
                name="sale_price"
                value={formData.sale_price}
                onChange={handleChange}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <ToggleButtonGroup
                          value={formData.sale_price_tax_inclusive ? 'incl' : 'excl'}
                          exclusive
                          size="small"
                          onChange={(_, v) => v && setFormData(p => ({ ...p, sale_price_tax_inclusive: v === 'incl' }))}
                        >
                          <ToggleButton value="incl" sx={{ fontSize: '0.65rem', py: 0.2 }}>With Tax</ToggleButton>
                          <ToggleButton value="excl" sx={{ fontSize: '0.65rem', py: 0.2 }}>Without Tax</ToggleButton>
                        </ToggleButtonGroup>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Wholesale Price"
                name="wholesale_price"
                value={formData.wholesale_price}
                onChange={handleChange}
                helperText="Price applied in Wholesale section"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Purchase Price"
                name="purchase_price"
                value={formData.purchase_price}
                onChange={handleChange}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <ToggleButtonGroup
                          value={formData.purchase_price_tax_inclusive ? 'incl' : 'excl'}
                          exclusive
                          size="small"
                          onChange={(_, v) => v && setFormData(p => ({ ...p, purchase_price_tax_inclusive: v === 'incl' }))}
                        >
                          <ToggleButton value="incl" sx={{ fontSize: '0.65rem', py: 0.2 }}>With Tax</ToggleButton>
                          <ToggleButton value="excl" sx={{ fontSize: '0.65rem', py: 0.2 }}>Without Tax</ToggleButton>
                        </ToggleButtonGroup>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="GST Rate %"
                name="gst_rate"
                value={formData.gst_rate}
                onChange={handleChange}
              >
                <MenuItem value={0}>0% (Exempt)</MenuItem>
                <MenuItem value={5}>5%</MenuItem>
                <MenuItem value={12}>12%</MenuItem>
                <MenuItem value={18}>18%</MenuItem>
                <MenuItem value={28}>28%</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Discount on Sale Price %"
                name="discount_on_sale"
                value={formData.discount_on_sale}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} sx={{ fontWeight: 700, color: '#64748b' }}>
          Cancel
        </Button>
        <Button 
          variant="outlined" 
          onClick={() => handleSubmit(true)}
          sx={{ fontWeight: 700, borderRadius: '10px' }}
        >
          Save as Draft
        </Button>
        <Button 
          variant="contained" 
          onClick={() => handleSubmit(false)}
          sx={{ fontWeight: 700, borderRadius: '10px', px: 3 }}
        >
          {initialData ? 'Update Item' : 'Create Item'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
