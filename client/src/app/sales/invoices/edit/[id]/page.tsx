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
  CircularProgress,
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
import { SalesService, ProductsService, Product, Party } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import PartySelect from '@/components/common/PartySelect';
import QuickAddProductDialog from '@/components/products/QuickAddProductDialog';

const filter = createFilterOptions<Product>();

export default function EditInvoicePage() {
  const { id } = useParams();
  const theme = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Form State
  const [party, setParty] = React.useState<Party | null>(null);
  const [invoiceNo, setInvoiceNo] = React.useState('');
  const [invoiceDate, setInvoiceDate] = React.useState('');
  const [paymentTerms, setPaymentTerms] = React.useState(0);
  const [items, setItems] = React.useState<any[]>([]);
  const [charges, setCharges] = React.useState<{ label: string, amount: number }[]>([]);
  const [manualDiscount, setManualDiscount] = React.useState(0);
  const [isFullyPaid, setIsFullyPaid] = React.useState(false);
  const [amountReceived, setAmountReceived] = React.useState(0);
  const [paymentMethod, setPaymentMethod] = React.useState('UPI');
  const [notes, setNotes] = React.useState('');
  const [status, setStatus] = React.useState('');

  // Item Search Dialog State
  const [isItemDialogOpen, setIsItemDialogOpen] = React.useState(false);
  const [itemSearch, setItemSearch] = React.useState('');
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [itemQty, setItemQty] = React.useState(1);
  const [isProductDialogOpen, setIsProductDialogOpen] = React.useState(false);

  // Fetch Existing Data
  const { isLoading: isLoadingInvoice } = useQuery({
    queryKey: ['sales-invoice', id],
    queryFn: async () => {
      const data = await SalesService.getSalesInvoices1(id as string) as any;
      
      setInvoiceNo(data.invoice_no || data.invoiceNo || '');
      setInvoiceDate(data.invoice_date || data.invoiceDate || '');
      setPaymentTerms(data.payment_terms || data.paymentTerms || 0);
      setItems(data.items || data.Items || []);
      setCharges(data.charges || data.Charges || data.additionalCharges || []);
      setManualDiscount(data.discountAmount || (data.total_discount - (data.items || []).reduce((s: number, i: any) => s + (i.discount || 0), 0)) || 0);
      setAmountReceived(data.paid_amount || data.paidAmount || 0);
      setPaymentMethod(data.payment_method || data.paymentMethod || 'UPI');
      setNotes(data.notes || '');
      setStatus(data.status || '');
      if (data.party_id || data.partyId) {
        setParty({ 
          id: data.party_id || data.partyId || '', 
          name: data.party_name || data.partyName || data.customer_name || '', 
          mobile: data.party_mobile || data.partyMobile || data.customer_phone || '' 
        } as any);
      } else {
        setParty(null);
      }
      
      return data;
    }
  });

  const { data: productsData } = useQuery({
    queryKey: ['products-search', itemSearch],
    queryFn: () => ProductsService.getProducts(itemSearch)
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => SalesService.putSalesInvoices(id as string, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['sales-invoice', id] });
      router.push(`/sales/invoices/view/${id}`);
    }
  });

  // Calculate Due Date based on terms
  const dueDate = React.useMemo(() => {
    if (!invoiceDate) return '';
    const date = new Date(invoiceDate);
    date.setDate(date.getDate() + (paymentTerms || 0));
    return date.toISOString().split('T')[0];
  }, [invoiceDate, paymentTerms]);

  // Totals Calculation
  const subtotal = items.reduce((sum, item) => sum + ((item.unit_price || item.price) * (item.quantity || item.qty)), 0);
  const totalTax = items.reduce((sum, item) => sum + (item.tax_amount || 0), 0);
  const taxableAmount = subtotal; 
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

    updateMutation.mutate(payload);
  };

  if (isLoadingInvoice) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ maxWidth: '1200px', margin: '0 auto', pb: 10 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <IconButton component={Link} href={`/sales/invoices/view/${id}`} sx={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', letterSpacing: '-0.5px' }}>
          Edit Sales Invoice
        </Typography>
      </Box>

      <Grid container spacing={3}>
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

          <Paper sx={{ p: 0, borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden', mb: 3 }}>
            <Box sx={{ p: 2, px: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Items</Typography>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" size="small" startIcon={<QrCodeScannerIcon />} sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, whiteSpace: 'nowrap', px: 2.5, py: 1 }}>Scan</Button>
                <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setIsItemDialogOpen(true)} sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, whiteSpace: 'nowrap', px: 2.5, py: 1 }}>Add Item</Button>
              </Stack>
            </Box>
            <TableContainer>
              <Table sx={{ minWidth: 800 }}>
                <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>ITEM</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>HSN</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#64748b' }} align="right">QTY</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#64748b' }} align="right">PRICE</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#64748b' }} align="right">TAX (%)</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#64748b' }} align="right">AMOUNT</TableCell>
                    <TableCell align="center"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ fontWeight: 600 }}>{item.product_name || item.name || item.ProductName}</TableCell>
                      <TableCell>{item.hsn_code || item.hsnCode || 'N/A'}</TableCell>
                      <TableCell align="right">{item.quantity || item.qty || item.Quantity}</TableCell>
                      <TableCell align="right">₹{(item.unit_price || item.price || item.UnitPrice || 0).toLocaleString()}</TableCell>
                      <TableCell align="right">{item.tax_rate || item.taxRate || item.TaxRate || 0}%</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>₹{(item.amount || item.Amount || 0).toLocaleString()}</TableCell>
                      <TableCell align="center">
                        <IconButton color="error" size="small" onClick={() => removeItem(index)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Paper sx={{ p: 3, borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Additional Charges</Typography>
              <Button startIcon={<AddCircleIcon />} onClick={addCharge} sx={{ fontWeight: 700 }}>Add Charge</Button>
            </Box>
            <Stack spacing={2}>
              {charges.map((charge, index) => (
                <Grid container spacing={2} key={index} sx={{ alignItems: 'center' }}>
                  <Grid size={{ xs: 7 }}>
                    <TextField label="Charge Label" size="small" fullWidth value={charge.label || (charge as any).Label} onChange={(e) => updateCharge(index, 'label', e.target.value)} />
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <TextField label="Amount" size="small" type="number" fullWidth value={charge.amount || (charge as any).Amount} onChange={(e) => updateCharge(index, 'amount', parseFloat(e.target.value) || 0)} slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }} />
                  </Grid>
                  <Grid size={{ xs: 1 }}>
                    <IconButton color="error" onClick={() => removeCharge(index)}><RemoveIcon /></IconButton>
                  </Grid>
                </Grid>
              ))}
            </Stack>
          </Paper>
        </Grid>

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
                <TextField label="Manual Discount" type="number" size="small" fullWidth value={manualDiscount} onChange={(e) => setManualDiscount(parseFloat(e.target.value) || 0)} slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }} />
                <Divider />
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
                
                <Button 
                  variant="contained" 
                  fullWidth 
                  startIcon={<SaveIcon />}
                  onClick={() => handleSave(false)}
                  disabled={updateMutation.isPending}
                  sx={{ borderRadius: '8px', py: 1.5, fontWeight: 700 }}
                >
                  {updateMutation.isPending ? 'Updating...' : 'Update Invoice'}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
          <Button variant="contained" onClick={handleAddItem} disabled={!selectedProduct} sx={{ borderRadius: '10px', px: 4, fontWeight: 800 }}>Add to Bill</Button>
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
