'use client';

import * as React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Autocomplete,
  Stack,
  alpha,
  useTheme,
  DialogContentText,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HistoryIcon from '@mui/icons-material/History';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import PrintIcon from '@mui/icons-material/Print';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import PostAddIcon from '@mui/icons-material/PostAdd';
import { db, generateId, Product, Party, SuspendedSale, SalesInvoice, Settings } from '@/lib/db';
import { initPOSData } from '@/lib/initData';
import { useLiveQuery } from 'dexie-react-hooks';
import { toast } from 'sonner';
import { InvoiceTemplate } from '@/components/pos/InvoiceTemplate';
import { useSection } from '@/context/SectionContext';

export default function POSPage() {
  const theme = useTheme();
  const { section } = useSection();
  
  React.useEffect(() => {
    initPOSData();
  }, []);

  // --- State ---
  const [cart, setCart] = React.useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = React.useState<Party | null>(null);
  const [discountAmount, setDiscountAmount] = React.useState(0);
  const [additionalCharges, setAdditionalCharges] = React.useState<{ label: string; amount: number }[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [barcodeInput, setBarcodeInput] = React.useState('');
  
  // --- Dialog States ---
  const [openCustomerDialog, setOpenCustomerDialog] = React.useState(false);
  const [openChargeDialog, setOpenChargeDialog] = React.useState(false);
  const [openSuspendedDialog, setOpenSuspendedDialog] = React.useState(false);
  const [openInvoiceDialog, setOpenInvoiceDialog] = React.useState(false);
  const [currentInvoice, setCurrentInvoice] = React.useState<any>(null);
  
  const [newCustomer, setNewCustomer] = React.useState({ name: '', mobile: '', email: '', gstin: '', address: '' });
  const [newCharge, setNewCharge] = React.useState({ label: '', amount: 0 });

  // --- Payment States ---
  const [openCheckoutDialog, setOpenCheckoutDialog] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState('Cash');
  const [receivedAmount, setReceivedAmount] = React.useState(0);

  // --- Queries ---
  const products = useLiveQuery(() => db.products.where('section').equals(section).toArray(), [section]) || [];
  const customers = useLiveQuery(() => db.parties.where('party_type').equals('customer').and(p => p.section === section).toArray(), [section]) || [];
  const suspendedSales = useLiveQuery(() => db.suspendedSales.where('section').equals(section).toArray(), [section]) || [];
  const settings = useLiveQuery(() => db.settings.toArray()) || [];

  const printerSize = settings.find((s: Settings) => s.key === 'printerSize')?.value || '3inch';
  const weighingPrefix = settings.find((s: Settings) => s.key === 'weighingPrefix')?.value || '21';
  const weighingItemCodeCount = parseInt(settings.find((s: Settings) => s.key === 'weighingItemCodeCount')?.value || '5');
  const weighingWeightCount = parseInt(settings.find((s: Settings) => s.key === 'weighingWeightCount')?.value || '5');

  // --- Stock Adjustment Helper ---
  const adjustStock = async (productId: string, delta: number) => {
    const product = await db.products.get(productId);
    if (product) {
      await db.products.update(productId, {
        stockQuantity: parseFloat(((product.stockQuantity || 0) + delta).toFixed(3))
      });
    }
  };

  // --- Cart Actions ---
  const addToCart = async (product: Product, quantity: number = 1) => {
    const existing = cart.find(item => item.id === product.id);
    const activePrice = section === 'wholesale' ? (product.wholesalePrice || product.salePrice) : product.salePrice;
    
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + quantity, price: activePrice } : item));
    } else {
      setCart([...cart, { ...product, qty: quantity, price: activePrice }]);
    }
    await adjustStock(product.id, -quantity);
  };

  const removeFromCart = async (id: string) => {
    const item = cart.find(i => i.id === id);
    if (item) {
      setCart(cart.filter(i => i.id !== id));
      await adjustStock(id, item.qty);
    }
  };

  const updateQty = async (id: string, newQty: number) => {
    const item = cart.find(i => i.id === id);
    if (item) {
      if (newQty <= 0) {
        removeFromCart(id);
        return;
      }
      const delta = newQty - item.qty;
      setCart(cart.map(i => i.id === id ? { ...i, qty: parseFloat(newQty.toFixed(3)) } : i));
      await adjustStock(id, -delta);
    }
  };

  // --- Barcode Handling ---
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput) return;

    // Check for weighing machine barcode
    const expectedLength = 2 + weighingItemCodeCount + weighingWeightCount;
    if (barcodeInput.length === expectedLength && barcodeInput.startsWith(weighingPrefix)) {
      const itemIdStr = barcodeInput.substring(2, 2 + weighingItemCodeCount);
      const weightStr = barcodeInput.substring(2 + weighingItemCodeCount, 2 + weighingItemCodeCount + weighingWeightCount);
      const weight = parseInt(weightStr) / 1000; // Assuming grams

      const product = products.find(p => p.itemCode === itemIdStr || p.barcode === barcodeInput.substring(0, 2 + weighingItemCodeCount));
      if (product) {
        addToCart(product, weight);
        toast.success(`Added ${product.name} (${weight}kg)`);
      } else {
        toast.error("Product not found for barcode: " + itemIdStr);
      }
    } else {
      // Normal barcode
      const product = products.find(p => p.barcode === barcodeInput || p.sku === barcodeInput);
      if (product) {
        addToCart(product);
        toast.success(`Added ${product.name}`);
      } else {
        toast.error("Product not found: " + barcodeInput);
      }
    }
    setBarcodeInput('');
  };

  // --- Totals ---
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const chargesTotal = additionalCharges.reduce((sum, c) => sum + c.amount, 0);
  const taxAmount = (subtotal - discountAmount) * 0.18; // 18% GST example
  const grandTotal = subtotal - discountAmount + chargesTotal + taxAmount;

  // --- Checkout ---
  const initiateCheckout = () => {
    if (cart.length === 0) return;
    setReceivedAmount(grandTotal);
    setOpenCheckoutDialog(true);
  };

  const handleCheckout = async () => {
    const invoice: SalesInvoice = {
      id: generateId(),
      invoiceNo: `INV-${Date.now().toString().slice(-6)}`,
      partyId: selectedCustomer?.id || 'walk-in',
      partyName: selectedCustomer?.name || 'Cash Customer',
      partyMobile: selectedCustomer?.mobile || '',
      partyEmail: selectedCustomer?.email || '',
      partyGstin: selectedCustomer?.gstin || '',
      partyAddress: selectedCustomer?.address || '',
      invoiceDate: new Date().toISOString(),
      status: 'Paid',
      subtotal,
      taxAmount,
      discountAmount,
      additionalCharges,
      grandTotal,
      paidAmount: grandTotal,
      receivedAmount,
      paymentMethod,
      changeAmount: Math.max(0, receivedAmount - grandTotal),
      balanceAmount: 0,
      items: cart,
      section: section,
    };

    await db.salesInvoices.add(invoice);
    setCurrentInvoice(invoice);
    setOpenInvoiceDialog(true);
    setOpenCheckoutDialog(false);
    
    // Clear POS
    setCart([]);
    setSelectedCustomer(null);
    setDiscountAmount(0);
    setAdditionalCharges([]);
    toast.success("Sale completed successfully!");
  };

  // --- Hold/Resume ---
  const handleHoldSale = async () => {
    if (cart.length === 0) return;
    
    const suspended: SuspendedSale = {
      id: generateId(),
      customerName: selectedCustomer?.name || 'Walk-in',
      customerMobile: selectedCustomer?.mobile || 'N/A',
      customerEmail: selectedCustomer?.email || '',
      items: cart,
      additionalCharges,
      discountAmount,
      section: section,
      createdAt: new Date().toISOString(),
    };

    await db.suspendedSales.add(suspended);
    setCart([]);
    setSelectedCustomer(null);
    setDiscountAmount(0);
    setAdditionalCharges([]);
    toast.info("Sale put on hold");
  };

  const handleResumeSale = (sale: SuspendedSale) => {
    setCart(sale.items);
    setAdditionalCharges(sale.additionalCharges);
    setDiscountAmount(sale.discountAmount);
    // Try to find customer
    const cust = customers.find(c => c.mobile === sale.customerMobile);
    if (cust) setSelectedCustomer(cust);
    
    db.suspendedSales.delete(sale.id);
    setOpenSuspendedDialog(false);
    toast.success("Sale resumed");
  };

  const deleteSuspendedSale = async (sale: SuspendedSale) => {
    // Restore stock
    for (const item of sale.items) {
      await adjustStock(item.id, item.qty);
    }
    await db.suspendedSales.delete(sale.id);
    toast.info("Suspended sale deleted and stock restored");
  };

  // --- Customer Actions ---
  const handleAddCustomer = async () => {
    if (!newCustomer.name || !newCustomer.mobile) {
      toast.error("Name and Mobile are required");
      return;
    }
    const id = generateId();
    const customer: Party = {
      id,
      name: newCustomer.name,
      party_type: 'customer',
      mobile: newCustomer.mobile,
      email: newCustomer.email,
      gstin: newCustomer.gstin,
      address: newCustomer.address,
      section: section,
      balance: 0,
      isActive: true,
    };
    await db.parties.add(customer);
    setSelectedCustomer(customer);
    setOpenCustomerDialog(false);
    setNewCustomer({ name: '', mobile: '', email: '', gstin: '', address: '' });
    toast.success("Customer added");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Box sx={{ flexGrow: 1, height: 'calc(100vh - 120px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a1a1a', letterSpacing: '-1px' }}>
          Point of Sale
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button 
            variant="outlined" 
            startIcon={<HistoryIcon />}
            sx={{ borderRadius: '12px' }}
          >
            History
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<PauseCircleIcon />}
            onClick={() => setOpenSuspendedDialog(true)}
            sx={{ borderRadius: '12px' }}
          >
            Suspended ({suspendedSales.length})
          </Button>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ flexGrow: 1, overflow: 'hidden' }}>
        {/* Left: Products & Customer */}
        <Grid size={{ xs: 12, md: 7.5, lg: 8 }} sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Customer Selection */}
          <Paper sx={{ p: 2, borderRadius: '16px' }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Autocomplete
                fullWidth
                options={customers}
                getOptionLabel={(option) => `${option.name} (${option.mobile})`}
                value={selectedCustomer}
                onChange={(_, newValue) => setSelectedCustomer(newValue)}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Select Customer" 
                    variant="outlined" 
                    size="small"
                    placeholder="Search by name or mobile..."
                  />
                )}
              />
              <IconButton 
                color="primary" 
                onClick={() => setOpenCustomerDialog(true)}
                sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1) }}
              >
                <PersonAddIcon />
              </IconButton>
            </Box>
          </Paper>

          {/* Product Search & List */}
          <Paper sx={{ p: 2, borderRadius: '16px', flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
              <form onSubmit={handleBarcodeSubmit} style={{ flexGrow: 1 }}>
                <TextField
                  fullWidth
                  placeholder="Scan barcode or type item code..."
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  variant="outlined"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f8fafc',
                      borderRadius: '12px',
                    }
                  }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: '#94a3b8' }} />
                        </InputAdornment>
                      ),
                    }
                  }}
                />
              </form>
              <TextField
                placeholder="Search products..."
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ width: '30%' }}
              />
            </Box>

            <Box sx={{ flexGrow: 1, overflow: 'auto', pr: 1 }}>
              <Grid container spacing={2}>
                {products
                  .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((product) => (
                    <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={product.id}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          cursor: 'pointer',
                          borderRadius: '16px',
                          border: '2px solid transparent',
                          backgroundColor: '#f8fafc',
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: theme.palette.primary.main,
                            backgroundColor: '#fff',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
                            transform: 'translateY(-2px)'
                          }
                        }}
                        onClick={() => addToCart(product)}
                      >
                        <Typography variant="subtitle2" sx={{ color: theme.palette.primary.main, fontWeight: 700, mb: 0.5 }}>
                          {product.sku}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 800, color: '#1e293b', mb: 1, lineClamp: 1, overflow: 'hidden' }}>
                          {product.name}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="h6" sx={{ fontWeight: 900, color: '#1e293b' }}>
                            ₹{product.salePrice}
                          </Typography>
                          <Chip 
                            label={(product.stockQuantity || 0) > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'} 
                            size="small"
                            color={(product.stockQuantity || 0) > 0 ? 'success' : 'error'}
                            variant="filled"
                            sx={{ fontWeight: 700, fontSize: '0.65rem' }}
                          />
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* Right: Cart & Summary */}
        <Grid size={{ xs: 12, md: 4.5, lg: 4 }} sx={{ height: '100%' }}>
          <Paper sx={{ 
            height: '100%', 
            borderRadius: '16px', 
            display: 'flex', 
            flexDirection: 'column', 
            overflow: 'hidden',
            border: '2px solid #fff',
            boxShadow: '0 10px 40px rgba(0,0,0,0.04)'
          }}>
            <Box sx={{ p: 2, backgroundColor: alpha(theme.palette.primary.main, 0.05), borderBottom: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.1) }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ p: 1, backgroundColor: theme.palette.primary.main, borderRadius: '8px', color: '#fff', display: 'flex' }}>
                    <ShoppingBagIcon fontSize="small" />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>Current Cart</Typography>
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                  {cart.length} Items
                </Typography>
              </Box>
            </Box>

            <List sx={{ flexGrow: 1, overflow: 'auto', p: 0 }}>
              {cart.length === 0 ? (
                <Box sx={{ p: 6, textAlign: 'center', opacity: 0.5 }}>
                  <ShoppingBagIcon sx={{ fontSize: 48, mb: 2, color: '#cbd5e1' }} />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>Empty Cart</Typography>
                </Box>
              ) : (
                cart.map((item) => (
                  <ListItem 
                    key={item.id} 
                    sx={{ 
                      px: 2, 
                      py: 1, 
                      borderBottom: '1px solid #f1f5f9',
                      '&:hover': { backgroundColor: '#fcfcfd' }
                    }}
                  >
                    <Box sx={{ flexGrow: 1, mr: 1 }}>
                      <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#1e293b' }}>
                        {item.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                        ₹{item.price} / unit
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }} component="div">
                      <TextField
                        size="small"
                        type="number"
                        value={item.qty}
                        onChange={(e) => updateQty(item.id, parseFloat(e.target.value) || 0)}
                        slotProps={{
                          input: {
                            sx: { 
                              width: '70px', 
                              height: '32px', 
                              fontSize: '0.85rem', 
                              fontWeight: 700,
                              '& input': { textAlign: 'center', p: 0.5 }
                            }
                          }
                        }}
                      />
                      <Typography sx={{ fontWeight: 900, minWidth: '70px', textAlign: 'right' }}>
                        ₹{(item.price * item.qty).toFixed(2)}
                      </Typography>
                      <IconButton size="small" onClick={() => removeFromCart(item.id)} sx={{ color: theme.palette.error.main }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </ListItem>
                ))
              )}
            </List>

            <Box sx={{ p: 2.5, backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
              <Stack spacing={1.5} sx={{ mb: 2 }} component="div">
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>Subtotal</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>₹{subtotal.toFixed(2)}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>Discount</Typography>
                    <IconButton size="small" onClick={() => {
                      const val = prompt("Enter discount amount:", discountAmount.toString());
                      if (val !== null) setDiscountAmount(parseFloat(val) || 0);
                    }}>
                      <LocalOfferIcon sx={{ fontSize: 14, color: theme.palette.secondary.main }} />
                    </IconButton>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: theme.palette.error.main }}>
                    -₹{discountAmount.toFixed(2)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>Extra Charges</Typography>
                    <IconButton size="small" onClick={() => setOpenChargeDialog(true)}>
                      <PostAddIcon sx={{ fontSize: 14, color: theme.palette.primary.main }} />
                    </IconButton>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>+₹{chargesTotal.toFixed(2)}</Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>GST (18%)</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>₹{taxAmount.toFixed(2)}</Typography>
                </Box>
                
                <Divider />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 0.5 }}>
                  <Typography variant="h5" sx={{ fontWeight: 900 }}>Total</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: theme.palette.primary.main }}>
                    ₹{grandTotal.toFixed(2)}
                  </Typography>
                </Box>
              </Stack>

              <Grid container spacing={1}>
                <Grid size={{ xs: 4 }}>
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    color="inherit" 
                    onClick={handleHoldSale}
                    disabled={cart.length === 0}
                    sx={{ py: 1.5, borderRadius: '12px', color: '#64748b' }}
                  >
                    Hold
                  </Button>
                </Grid>
                <Grid size={{ xs: 8 }}>
                  <Button 
                    fullWidth 
                    variant="contained" 
                    size="large"
                    onClick={initiateCheckout}
                    disabled={cart.length === 0}
                    sx={{ 
                      py: 1.5, 
                      borderRadius: '12px',
                      backgroundColor: theme.palette.primary.main,
                      fontWeight: 800,
                      boxShadow: '0 10px 20px rgba(76, 59, 207, 0.2)'
                    }}
                  >
                    Pay & Print
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* --- Dialogs --- */}
      
      {/* Add Customer Dialog */}
      <Dialog open={openCustomerDialog} onClose={() => setOpenCustomerDialog(false)}>
        <DialogTitle sx={{ fontWeight: 800 }}>Add New Customer</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={3} sx={{ mt: 1, minWidth: 300 }} component="div">
            <TextField 
              label="Customer Name" 
              fullWidth 
              value={newCustomer.name}
              onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
            />
            <TextField 
              label="Mobile Number" 
              fullWidth 
              value={newCustomer.mobile}
              onChange={(e) => setNewCustomer({ ...newCustomer, mobile: e.target.value })}
            />
            <TextField 
              label="Email Address" 
              fullWidth 
              value={newCustomer.email}
              onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
            />
            <TextField 
              label="GSTIN" 
              fullWidth 
              placeholder="e.g. 29ABCDE1234F1Z5"
              value={newCustomer.gstin}
              onChange={(e) => setNewCustomer({ ...newCustomer, gstin: e.target.value })}
            />
            <TextField 
              label="Address" 
              fullWidth 
              multiline
              rows={2}
              value={newCustomer.address}
              onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenCustomerDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddCustomer} sx={{ borderRadius: '10px' }}>Create Customer</Button>
        </DialogActions>
      </Dialog>

      {/* Additional Charges Dialog */}
      <Dialog open={openChargeDialog} onClose={() => setOpenChargeDialog(false)}>
        <DialogTitle sx={{ fontWeight: 800 }}>Add Extra Charge</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1, minWidth: 300 }} component="div">
            <TextField 
              label="Charge Label (e.g. Packing, Delivery)" 
              fullWidth 
              value={newCharge.label}
              onChange={(e) => setNewCharge({ ...newCharge, label: e.target.value })}
            />
            <TextField 
              label="Amount" 
              type="number" 
              fullWidth 
              value={newCharge.amount}
              onChange={(e) => setNewCharge({ ...newCharge, amount: parseFloat(e.target.value) || 0 })}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenChargeDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              if (newCharge.label && newCharge.amount > 0) {
                setAdditionalCharges([...additionalCharges, newCharge]);
                setNewCharge({ label: '', amount: 0 });
                setOpenChargeDialog(false);
              }
            }}
          >
            Add Charge
          </Button>
        </DialogActions>
      </Dialog>

      {/* Suspended Sales Dialog */}
      <Dialog open={openSuspendedDialog} onClose={() => setOpenSuspendedDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Suspended Sales</DialogTitle>
        <DialogContent>
          <List>
            {suspendedSales.length === 0 ? (
              <Typography sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>No suspended sales</Typography>
            ) : (
              suspendedSales.map((sale: SuspendedSale) => (
                <ListItem 
                  key={sale.id}
                  sx={{ 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '12px', 
                    mb: 1.5,
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{sale.customerName}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>{sale.customerMobile} • {sale.items.length} items</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{new Date(sale.createdAt).toLocaleString()}</Typography>
                  </Box>
                  <Stack direction="row" spacing={1} component="div">
                    <Button variant="contained" size="small" onClick={() => handleResumeSale(sale)} sx={{ borderRadius: '8px' }}>Resume</Button>
                    <IconButton color="error" onClick={() => deleteSuspendedSale(sale)}><DeleteIcon /></IconButton>
                  </Stack>
                </ListItem>
              ))
            )}
          </List>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenSuspendedDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Checkout Dialog */}
      <Dialog open={openCheckoutDialog} onClose={() => setOpenCheckoutDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, textAlign: 'center', pb: 0 }}>Checkout Details</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2, textAlign: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 900, color: theme.palette.primary.main, mb: 1 }}>
              ₹{grandTotal.toFixed(2)}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>Total Payable Amount</Typography>
          </Box>
          
          <Divider sx={{ mb: 3 }} />

          <Stack spacing={3} component="div">
            <Autocomplete
              options={['Cash', 'Card', 'UPI', 'Bank Transfer']}
              value={paymentMethod}
              onChange={(_, newValue) => setPaymentMethod(newValue || 'Cash')}
              renderInput={(params) => <TextField {...params} label="Payment Method" />}
            />
            <TextField
              label="Received Amount"
              fullWidth
              type="number"
              value={receivedAmount}
              onChange={(e) => setReceivedAmount(parseFloat(e.target.value) || 0)}
              onFocus={(e) => e.target.select()}
              autoFocus
            />
            <Paper sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: '12px', textAlign: 'center' }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>Change to Return</Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: (receivedAmount - grandTotal) >= 0 ? theme.palette.success.main : theme.palette.error.main }}>
                ₹{(receivedAmount - grandTotal).toFixed(2)}
              </Typography>
            </Paper>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button fullWidth variant="outlined" onClick={() => setOpenCheckoutDialog(false)} sx={{ py: 1.5, borderRadius: '12px' }}>Cancel</Button>
          <Button 
            fullWidth 
            variant="contained" 
            onClick={handleCheckout}
            disabled={receivedAmount < grandTotal}
            sx={{ py: 1.5, borderRadius: '12px', fontWeight: 800 }}
          >
            Confirm & Print
          </Button>
        </DialogActions>
      </Dialog>

      {/* Invoice View/Print Dialog */}
      <Dialog open={openInvoiceDialog} onClose={() => setOpenInvoiceDialog(false)} maxWidth="xs">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 800 }}>Invoice Generated</Typography>
          <IconButton onClick={() => setOpenInvoiceDialog(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, backgroundColor: '#f1f5f9', display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ p: 2 }}>
            <Paper elevation={4} sx={{ borderRadius: 0 }}>
              {currentInvoice && <InvoiceTemplate data={currentInvoice} printerSize={printerSize as any} />}
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, backgroundColor: '#fff' }}>
          <Button fullWidth variant="outlined" onClick={() => setOpenInvoiceDialog(false)}>Close</Button>
          <Button 
            fullWidth 
            variant="contained" 
            startIcon={<PrintIcon />} 
            onClick={handlePrint}
            sx={{ backgroundColor: theme.palette.primary.main }}
          >
            Print Receipt
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hidden Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .MuiDialog-root * {
            visibility: hidden;
          }
          .MuiDialog-root .MuiPaper-root {
            visibility: visible;
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            box-shadow: none !important;
            border: none !important;
          }
          .MuiDialog-root .MuiPaper-root * {
            visibility: visible;
          }
          .MuiDialogTitle-root, .MuiDialogActions-root {
            display: none !important;
          }
        }
      `}</style>
    </Box>
  );
}
