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
  Card,
  CardContent,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { PurchaseReturnService, ProductsService, PartiesService, PurchaseService, Product, Party } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PartySelect from '@/components/common/PartySelect';

export default function CreatePurchaseReturnPage() {
  const theme = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Form State
  const [party, setParty] = React.useState<Party | null>(null);
  const [returnNo, setReturnNo] = React.useState('');
  const [returnDate, setReturnDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [selectedInvoice, setSelectedInvoice] = React.useState<any | null>(null);
  const [items, setItems] = React.useState<any[]>([]);
  const [charges, setCharges] = React.useState<{ label: string, amount: number }[]>([]);
  const [manualDiscount, setManualDiscount] = React.useState(0);
  const [paymentMethod, setPaymentMethod] = React.useState('Cash');
  const [notes, setNotes] = React.useState('');

  // Item Search Dialog State
  const [isItemDialogOpen, setIsItemDialogOpen] = React.useState(false);
  const [itemSearch, setItemSearch] = React.useState('');
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [itemQty, setItemQty] = React.useState(1);


  const { data: productsData } = useQuery({
    queryKey: ['products-search', itemSearch],
    queryFn: () => ProductsService.getProducts(itemSearch)
  });

  const { data: invoicesData } = useQuery({
    queryKey: ['purchase-bills-search', party?.id],
    queryFn: () => PurchaseService.getPurchaseBills(party?.id),
    enabled: !!party
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => PurchaseReturnService.postPurchaseReturns(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-returns'] });
      router.push('/purchase/returns');
    }
  });

  // Totals Calculation
  const subtotal = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  const totalTax = items.reduce((sum, item) => sum + (item.tax_amount || 0), 0);
  const taxableAmount = subtotal;
  const totalDiscount = items.reduce((sum, item) => sum + (item.discount || 0), 0) + manualDiscount;
  const totalCharges = charges.reduce((sum, charge) => sum + charge.amount, 0);
  
  const grandTotalRaw = subtotal + totalTax + totalCharges - manualDiscount;
  const grandTotal = Math.round(grandTotalRaw);
  const roundOff = grandTotal - grandTotalRaw;

  const handleAddItem = () => {
    if (!selectedProduct) return;
    
    const taxRate = (selectedProduct as any).gst_rate || 0;
    const unitPrice = selectedProduct.purchase_price || 0;
    const amount = unitPrice * itemQty;
    const taxAmount = (amount * taxRate) / 100;

    const newItem = {
      product_id: selectedProduct.id,
      product_name: selectedProduct.name,
      hsn_code: (selectedProduct as any).hsn_sac_code || '',
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

  const handleInvoiceSelect = (invoice: any | null) => {
    setSelectedInvoice(invoice);
    if (invoice && invoice.items) {
      const returnItems = (invoice.items as any[]).map(item => ({
        product_id: item.product_id,
        product_name: item.product_name,
        hsn_code: item.hsn_code,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount: item.discount,
        tax_rate: item.tax_rate,
        tax_amount: item.tax_amount,
        amount: item.amount,
        barcode: item.barcode
      }));
      setItems(returnItems);
    }
  };

  const handleSave = (isDraft: boolean) => {
    if (!party) {
      alert('Please select a vendor');
      return;
    }
    if (items.length === 0) {
      alert('Please add at least one item');
      return;
    }

    const payload = {
      return_no: returnNo,
      invoice_id: selectedInvoice?.id || '',
      invoice_no: selectedInvoice?.invoice_no || selectedInvoice?.bill_no || '',
      party_id: party.id,
      party_name: party.name,
      party_mobile: party.mobile,
      return_date: returnDate,
      status: isDraft ? 'draft' : 'completed',
      subtotal: subtotal,
      taxable_amount: taxableAmount,
      total_tax: totalTax,
      total_discount: totalDiscount,
      round_off: roundOff,
      grand_total: grandTotal,
      paid_amount: 0, // In return, we usually don't "pay", we get credit
      balance_amount: grandTotal,
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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <IconButton component={Link} href="/purchase/returns" sx={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', letterSpacing: '-0.5px' }}>
          Create Purchase Return
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9', mb: 3 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <PartySelect
                  party_type="vendor"
                  value={party}
                  onChange={(newValue) => {
                    setParty(newValue);
                    setSelectedInvoice(null);
                    setItems([]);
                  }}
                  label="Select Vendor"
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Autocomplete
                  options={(invoicesData as any)?.data || []}
                  getOptionLabel={(option) => `${option.invoice_no || option.bill_no} (${option.invoice_date || option.bill_date}) - ₹${option.grand_total}`}
                  value={selectedInvoice}
                  disabled={!party}
                  onChange={(_, newValue) => handleInvoiceSelect(newValue)}
                  renderInput={(params) => <TextField {...params} label="Link to Purchase Bill (Optional)" fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField 
                  label="Return Number" 
                  fullWidth 
                  value={returnNo} 
                  onChange={(e) => setReturnNo(e.target.value)}
                  placeholder="Auto Generated"
                  slotProps={{ input: { readOnly: true, sx: { backgroundColor: '#f8fafc', borderRadius: '12px' } } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField 
                  label="Return Date" 
                  type="date" 
                  fullWidth 
                  value={returnDate} 
                  onChange={(e) => setReturnDate(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true }, input: { sx: { borderRadius: '12px' } } }}
                />
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 0, borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9', overflow: 'hidden', mb: 3 }}>
            <Box sx={{ p: 2, px: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Items to Return</Typography>
              <Button 
                variant="contained" 
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setIsItemDialogOpen(true)}
                sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
              >
                Add Item
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>ITEM</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#64748b' }} align="right">QTY</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#64748b' }} align="right">PRICE</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#64748b' }} align="right">AMOUNT</TableCell>
                    <TableCell align="center"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4, color: '#94a3b8' }}>
                        No items added.
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ fontWeight: 600 }}>{item.product_name}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">₹{item.unit_price.toLocaleString()}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>₹{item.amount.toLocaleString()}</TableCell>
                        <TableCell align="center">
                          <IconButton color="error" size="small" onClick={() => setItems(items.filter((_, i) => i !== index))}>
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

          <Paper sx={{ p: 3, borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Additional Charges</Typography>
              <Button startIcon={<AddCircleIcon />} onClick={() => setCharges([...charges, { label: '', amount: 0 }])}>Add Charge</Button>
            </Box>
            {charges.map((charge, index) => (
              <Grid container spacing={2} key={index} sx={{ mb: 2, alignItems: 'center' }}>
                <Grid size={{ xs: 7 }}>
                  <TextField 
                    label="Charge Label" 
                    size="small" 
                    fullWidth 
                    value={charge.label}
                    onChange={(e) => {
                      const newCharges = [...charges];
                      newCharges[index].label = e.target.value;
                      setCharges(newCharges);
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <TextField 
                    label="Amount" 
                    size="small" 
                    type="number" 
                    fullWidth 
                    value={charge.amount}
                    onChange={(e) => {
                      const newCharges = [...charges];
                      newCharges[index].amount = parseFloat(e.target.value) || 0;
                      setCharges(newCharges);
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>
                <Grid size={{ xs: 1 }}>
                  <IconButton color="error" onClick={() => setCharges(charges.filter((_, i) => i !== index))}><DeleteIcon /></IconButton>
                </Grid>
              </Grid>
            ))}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Summary</Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="#64748b">Subtotal</Typography>
                  <Typography sx={{ fontWeight: 600 }}>₹{subtotal.toLocaleString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="#64748b">Total Tax</Typography>
                  <Typography sx={{ fontWeight: 600 }}>₹{totalTax.toLocaleString()}</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>Total Debit</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.primary.main }}>₹{grandTotal.toLocaleString()}</Typography>
                </Box>
                <TextField 
                  label="Notes" 
                  multiline 
                  rows={3} 
                  fullWidth 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
                <Button 
                  variant="contained" 
                  fullWidth 
                  startIcon={<SaveIcon />}
                  onClick={() => handleSave(false)}
                  disabled={createMutation.isPending}
                  sx={{ 
                    borderRadius: '12px', 
                    py: 1.5, 
                    fontWeight: 800,
                    boxShadow: '0 8px 20px ' + alpha(theme.palette.primary.main, 0.3)
                  }}
                >
                  {createMutation.isPending ? 'Saving...' : 'Save Purchase Return'}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={isItemDialogOpen} onClose={() => setIsItemDialogOpen(false)} fullWidth maxWidth="sm" slotProps={{ paper: { sx: { borderRadius: '24px' } } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Add Product to Return</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Autocomplete
              options={productsData?.data || []}
              getOptionLabel={(option) => `${option.name} (${option.sku})`}
              onInputChange={(_, value) => setItemSearch(value)}
              onChange={(_, newValue) => setSelectedProduct(newValue)}
              renderInput={(params) => <TextField {...params} label="Search Product" fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />}
            />
            <TextField 
              label="Quantity" 
              type="number" 
              fullWidth 
              value={itemQty} 
              onChange={(e) => setItemQty(parseFloat(e.target.value) || 1)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setIsItemDialogOpen(false)} sx={{ fontWeight: 700 }}>Cancel</Button>
          <Button variant="contained" onClick={handleAddItem} disabled={!selectedProduct} sx={{ borderRadius: '10px', fontWeight: 700, px: 3 }}>Add Item</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
