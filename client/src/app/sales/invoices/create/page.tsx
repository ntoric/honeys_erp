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
  Stack,
  Divider,
  alpha,
  useTheme,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Card,
  CardContent,
  Tooltip,
  createFilterOptions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import SearchIcon from '@mui/icons-material/Search';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RemoveIcon from '@mui/icons-material/RemoveCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { SalesService, ProductsService, PartiesService, Product, Party } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PartySelect from '@/components/common/PartySelect';
import QuickAddProductDialog from '@/components/products/QuickAddProductDialog';

const filter = createFilterOptions<Product>();

export default function CreateInvoicePage() {
  const theme = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Form State
  const [party, setParty] = React.useState<Party | null>(null);
  const [invoiceNo, setInvoiceNo] = React.useState('');
  const [invoiceDate, setInvoiceDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [paymentTerms, setPaymentTerms] = React.useState(0);
  const [dueDate, setDueDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = React.useState<any[]>([]);
  const [charges, setCharges] = React.useState<{ label: string, amount: number }[]>([]);
  const [manualDiscount, setManualDiscount] = React.useState(0);
  const [isFullyPaid, setIsFullyPaid] = React.useState(false);
  const [amountReceived, setAmountReceived] = React.useState(0);
  const [paymentMethod, setPaymentMethod] = React.useState('UPI');
  const [notes, setNotes] = React.useState('');

  // Item Search Dialog State
  const [isItemDialogOpen, setIsItemDialogOpen] = React.useState(false);
  const [itemSearch, setItemSearch] = React.useState('');
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [itemQty, setItemQty] = React.useState(1);
  const [isProductDialogOpen, setIsProductDialogOpen] = React.useState(false);


  const { data: productsData } = useQuery({
    queryKey: ['products-search', itemSearch],
    queryFn: () => ProductsService.getProducts(itemSearch)
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => SalesService.postSalesInvoices(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-invoices'] });
      router.push('/sales/invoices');
    }
  });

  // Calculate Due Date based on terms
  React.useEffect(() => {
    const date = new Date(invoiceDate);
    date.setDate(date.getDate() + (paymentTerms || 0));
    setDueDate(date.toISOString().split('T')[0]);
  }, [invoiceDate, paymentTerms]);

  // Totals Calculation
  const subtotal = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  const totalTax = items.reduce((sum, item) => sum + (item.tax_amount || 0), 0);
  const taxableAmount = subtotal; // Simplified
  const totalDiscount = items.reduce((sum, item) => sum + (item.discount || 0), 0) + manualDiscount;
  const totalCharges = charges.reduce((sum, charge) => sum + charge.amount, 0);
  
  const grandTotalRaw = subtotal + totalTax + totalCharges - manualDiscount;
  const grandTotal = Math.round(grandTotalRaw);
  const roundOff = grandTotal - grandTotalRaw;
  const balance = grandTotal - amountReceived;

  React.useEffect(() => {
    if (isFullyPaid) setAmountReceived(grandTotal);
  }, [isFullyPaid, grandTotal]);

  const handleAddItem = () => {
    if (!selectedProduct) return;
    
    const taxRate = (selectedProduct as any).gst_rate || 0;
    const unitPrice = selectedProduct.sale_price || 0;
    const amount = unitPrice * itemQty;
    const taxAmount = (amount * taxRate) / 100;

    const newItem = {
      product_id: selectedProduct.id,
      product_name: selectedProduct.name,
      hsn_code: selectedProduct.hsn_code || (selectedProduct as any).hsn_sac_code || '',
      quantity: itemQty,
      unit_price: unitPrice,
      discount: 0,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      amount: amount,
      barcode: selectedProduct.barcode || ''
    };

    setItems([...items, newItem]);
    setIsItemDialogOpen(false);
    setSelectedProduct(null);
    setItemQty(1);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const addCharge = () => {
    setCharges([...charges, { label: '', amount: 0 }]);
  };

  const removeCharge = (index: number) => {
    setCharges(charges.filter((_, i) => i !== index));
  };

  const updateCharge = (index: number, field: 'label' | 'amount', value: any) => {
    const newCharges = [...charges];
    newCharges[index] = { ...newCharges[index], [field]: value };
    setCharges(newCharges);
  };

  const handleSave = (isDraft: boolean) => {
    if (!party) {
      alert('Please select a party');
      return;
    }
    if (items.length === 0) {
      alert('Please add at least one item');
      return;
    }

    const payload = {
      invoice_no: invoiceNo,
      party_id: party.id,
      party_name: party.name,
      party_mobile: party.mobile,
      invoice_date: invoiceDate,
      due_date: dueDate,
      payment_terms: paymentTerms,
      status: isDraft ? 'draft' : (balance <= 0 ? 'paid' : 'unpaid'),
      subtotal: subtotal,
      taxable_amount: taxableAmount,
      total_tax: totalTax,
      total_discount: totalDiscount,
      round_off: roundOff,
      grand_total: grandTotal,
      paid_amount: amountReceived,
      balance_amount: balance,
      payment_method: paymentMethod,
      notes: notes,
      is_draft: isDraft,
      items: items,
      charges: charges
    };

    createMutation.mutate(payload);
  };

  return (
    <Box sx={{ maxWidth: '1200px', margin: '0 auto', pb: 10 }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        gap: 2, 
        mb: 4 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton component={Link} href="/sales/invoices" sx={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', letterSpacing: '-0.5px' }}>
            Create Sales Invoice
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Left Side - Details */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', mb: 3 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <PartySelect
                  party_type="customer"
                  value={party}
                  onChange={(newValue) => setParty(newValue)}
                  label="Select Party"
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField 
                  label="Invoice Number" 
                  fullWidth 
                  value={invoiceNo} 
                  onChange={(e) => setInvoiceNo(e.target.value)}
                  placeholder="Auto Generated"
                  slotProps={{ input: { readOnly: true, sx: { backgroundColor: '#f8fafc' } } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField 
                  label="Invoice Date" 
                  type="date" 
                  fullWidth 
                  value={invoiceDate} 
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField 
                  label="Payment Term (Days)" 
                  type="number" 
                  fullWidth 
                  value={paymentTerms} 
                  onChange={(e) => setPaymentTerms(parseInt(e.target.value) || 0)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField 
                  label="Due Date" 
                  type="date" 
                  fullWidth 
                  value={dueDate} 
                  disabled
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Items Table */}
          <Paper sx={{ p: 0, borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden', mb: 3 }}>
            <Box sx={{ 
              p: 2, 
              px: 3,
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' }, 
              justifyContent: 'space-between', 
              alignItems: { xs: 'flex-start', sm: 'center' }, 
              gap: 2,
              borderBottom: '1px solid #f1f5f9' 
            }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Items</Typography>
              <Stack direction="row" spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                <Button 
                  variant="outlined" 
                  size="small"
                  startIcon={<QrCodeScannerIcon />}
                  fullWidth
                  sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, whiteSpace: 'nowrap', px: 2.5, py: 1 }}
                >
                  Scan
                </Button>
                <Button 
                  variant="contained" 
                  size="small"
                  startIcon={<AddIcon />}
                  fullWidth
                  onClick={() => setIsItemDialogOpen(true)}
                  sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, whiteSpace: 'nowrap', px: 2.5, py: 1 }}
                >
                  Add Item
                </Button>
              </Stack>
            </Box>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: { xs: 800, md: '100%' } }}>
                <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.75rem' }}>ITEM</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.75rem' }}>HSN</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.75rem' }} align="right">QTY</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.75rem' }} align="right">PRICE</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.75rem' }} align="right">TAX (%)</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.75rem' }} align="right">AMOUNT</TableCell>
                    <TableCell align="center"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#94a3b8' }}>
                        No items added yet. Click "Add Item" to start.
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.product_name}</TableCell>
                        <TableCell sx={{ fontSize: '0.875rem' }}>{item.hsn_code}</TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.875rem' }}>{item.quantity}</TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.875rem' }}>₹{item.unit_price.toLocaleString()}</TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.875rem' }}>{item.tax_rate}%</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.875rem' }}>₹{item.amount.toLocaleString()}</TableCell>
                        <TableCell align="center">
                          <IconButton color="error" size="small" onClick={() => removeItem(index)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Additional Charges Section */}
          <Paper sx={{ p: 3, borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Additional Charges</Typography>
              <Button 
                startIcon={<AddCircleIcon />} 
                onClick={addCharge}
                sx={{ fontWeight: 700 }}
              >
                Add Charge
              </Button>
            </Box>
            
            {charges.length === 0 ? (
              <Typography sx={{ color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', py: 2 }}>
                No additional charges added.
              </Typography>
            ) : (
              <Stack spacing={2}>
                {charges.map((charge, index) => (
                  <Grid container spacing={2} key={index} sx={{ alignItems: 'center' }}>
                    <Grid size={{ xs: 7 }}>
                      <TextField 
                        label="Charge Label" 
                        size="small" 
                        fullWidth 
                        value={charge.label}
                        onChange={(e) => updateCharge(index, 'label', e.target.value)}
                        placeholder="e.g. Shipping, Handling"
                      />
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <TextField 
                        label="Amount" 
                        size="small" 
                        type="number" 
                        fullWidth 
                        value={charge.amount}
                        onChange={(e) => updateCharge(index, 'amount', parseFloat(e.target.value) || 0)}
                        slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 1 }}>
                      <IconButton color="error" onClick={() => removeCharge(index)}>
                        <RemoveIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>

        {/* Right Side - Summary */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', mb: 3, border: '1px solid #f1f5f9' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Summary</Typography>
              
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Subtotal</Typography>
                  <Typography sx={{ fontWeight: 600 }}>₹{subtotal.toLocaleString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Total Tax</Typography>
                  <Typography sx={{ fontWeight: 600 }}>+₹{totalTax.toLocaleString()}</Typography>
                </Box>
                {charges.map((charge, i) => charge.amount > 0 && (
                  <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="text.secondary">{charge.label || 'Charge'}</Typography>
                    <Typography sx={{ fontWeight: 600 }}>+₹{charge.amount.toLocaleString()}</Typography>
                  </Box>
                ))}
                <TextField 
                  label="Manual Discount" 
                  type="number" 
                  size="small" 
                  fullWidth 
                  value={manualDiscount}
                  onChange={(e) => setManualDiscount(parseFloat(e.target.value) || 0)}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }}
                />
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography color="text.secondary">Round Off</Typography>
                  <Typography sx={{ fontWeight: 500, color: '#94a3b8' }}>{roundOff > 0 ? '+' : ''}{roundOff.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h5" sx={{ fontWeight: 900 }}>Total</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: theme.palette.primary.main }}>₹{grandTotal.toLocaleString()}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Payment</Typography>
              <Stack spacing={3}>
                <FormControlLabel
                  control={<Checkbox checked={isFullyPaid} onChange={(e) => setIsFullyPaid(e.target.checked)} />}
                  label={<Typography sx={{ fontWeight: 700 }}>Mark as Fully Paid</Typography>}
                />
                <TextField 
                  label="Amount Received" 
                  type="number" 
                  fullWidth 
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(parseFloat(e.target.value) || 0)}
                  disabled={isFullyPaid}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }}
                />
                <TextField
                  select
                  label="Payment Method"
                  fullWidth
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <MenuItem value="UPI">UPI</MenuItem>
                  <MenuItem value="Cash">Cash</MenuItem>
                  <MenuItem value="Card">Card</MenuItem>
                </TextField>
                <Box sx={{ p: 2, backgroundColor: alpha(theme.palette.primary.main, 0.05), borderRadius: '12px', display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontWeight: 700, color: '#64748b' }}>Balance</Typography>
                  <Typography sx={{ fontWeight: 800, color: theme.palette.primary.main }}>₹{balance.toLocaleString()}</Typography>
                </Box>
                
                <Stack direction="row" spacing={2}>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    startIcon={<SaveIcon />}
                    onClick={() => handleSave(true)}
                    sx={{ borderRadius: '8px', py: 1.2, fontWeight: 600 }}
                  >
                    Draft
                  </Button>
                  <Button 
                    variant="contained" 
                    fullWidth 
                    startIcon={<SendIcon />}
                    onClick={() => handleSave(false)}
                    disabled={createMutation.isPending}
                    sx={{ borderRadius: '8px', py: 1.2, fontWeight: 700 }}
                  >
                    {createMutation.isPending ? 'Saving...' : 'Save & Print'}
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Item Dialog */}
      <Dialog open={isItemDialogOpen} onClose={() => setIsItemDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 900 }}>Add Product to Invoice</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Autocomplete
              options={productsData?.data || []}
              getOptionLabel={(option) => {
                if (typeof option === 'string') {
                  return option;
                }
                if (option.id === 'add-new-product') {
                  return option.name || '';
                }
                return `${option.name} (${option.sku})`;
              }}
              filterOptions={(options, params) => {
                const filtered = filter(options, params);
                const { inputValue } = params;

                const isExisting = options.some((option) => inputValue.toLowerCase() === option.name?.toLowerCase());
                if (inputValue !== '' && !isExisting) {
                  filtered.push({
                    id: 'add-new-product',
                    name: `Add "${inputValue}"`,
                  } as any);
                }

                filtered.push({
                  id: 'add-new-product',
                  name: '+ Create New Item',
                } as any);

                return filtered;
              }}
              onInputChange={(_, value) => setItemSearch(value)}
              onChange={(_, newValue) => {
                if (newValue && newValue.id === 'add-new-product') {
                  setIsProductDialogOpen(true);
                } else {
                  setSelectedProduct(newValue);
                }
              }}
              renderOption={(props, option: any) => {
                const { key, ...restProps } = props as any;
                if (option.id === 'add-new-product') {
                  return (
                    <Box component="li" key="add-new-product" {...restProps} sx={{ color: 'primary.main', fontWeight: 700 }}>
                      <AddCircleIcon sx={{ mr: 1, fontSize: 20 }} />
                      {option.name}
                    </Box>
                  );
                }
                return (
                  <Box component="li" key={option.id} {...restProps}>
                    <Box>
                      <Typography sx={{ fontWeight: 600 }}>{option.name}</Typography>
                      <Typography variant="caption" color="text.secondary">SKU: {option.sku} | Price: ₹{option.sale_price} | Tax: {option.gst_rate}%</Typography>
                    </Box>
                  </Box>
                );
              }}
              renderInput={(params) => <TextField {...params} label="Search Product" fullWidth />}
            />
            {selectedProduct && (
              <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary">Stock</Typography>
                    <Typography sx={{ fontWeight: 700 }}>{(selectedProduct as any).stock_quantity} {(selectedProduct as any).measuring_unit}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary">Sale Price</Typography>
                    <Typography sx={{ fontWeight: 700 }}>₹{selectedProduct.sale_price?.toLocaleString()}</Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
            <TextField 
              label="Quantity" 
              type="number" 
              fullWidth 
              value={itemQty} 
              onChange={(e) => setItemQty(parseFloat(e.target.value) || 1)}
            />

          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setIsItemDialogOpen(false)} sx={{ fontWeight: 700 }}>Cancel</Button>
          <Button variant="contained" onClick={handleAddItem} disabled={!selectedProduct} sx={{ borderRadius: '10px', px: 4, fontWeight: 800 }}>
            Add to Bill
          </Button>
        </DialogActions>
      </Dialog>

      <QuickAddProductDialog
        open={isProductDialogOpen}
        onClose={() => setIsProductDialogOpen(false)}
        onSuccess={(newProduct) => {
          setSelectedProduct(newProduct);
        }}
      />
    </Box>
  );
}
