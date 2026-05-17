'use client';

import * as React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Grid, 
  Divider, 
  Stack, 
  IconButton, 
  Chip, 
  alpha, 
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import EditIcon from '@mui/icons-material/Edit';
import ShareIcon from '@mui/icons-material/Share';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { SalesService } from '@/api';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function InvoiceDetail() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useParams();
  
  const { data, isLoading } = useQuery({
    queryKey: ['sales-invoice', id],
    queryFn: () => SalesService.getSalesInvoices1(id as string),
    enabled: !!id
  });

  const invoice = data as any;

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!invoice) {
    return (
      <Box sx={{ textAlign: 'center', py: 10 }}>
        <Typography variant="h5" color="text.secondary">Invoice not found</Typography>
        <Button component={Link} href="/sales/invoices" sx={{ mt: 2 }}>Back to Invoices</Button>
      </Box>
    );
  }

  const status = (invoice?.status || '').toLowerCase();
  let statusColor = '#64748b';
  let statusBg = '#f1f5f9';
  if (status === 'paid') { statusColor = '#10b981'; statusBg = '#f0fdf4'; }
  else if (status === 'unpaid') { statusColor = '#f59e0b'; statusBg = '#fffbeb'; }
  else if (status === 'cancelled') { statusColor = '#ef4444'; statusBg = '#fef2f2'; }

  return (
    <Box sx={{ maxWidth: '1000px', margin: '0 auto', pb: 10 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, '@media print': { display: 'none' } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton component={Link} href="/sales/invoices" sx={{ backgroundColor: '#ffffff' }}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e293b', letterSpacing: '-1.5px' }}>
              Invoice #{invoice.invoice_no || invoice.invoiceNo || 'N/A'}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 0.5, alignItems: 'center' }}>
              <Chip 
                label={(invoice.status || 'DRAFT').toUpperCase()} 
                size="small" 
                sx={{ fontWeight: 800, backgroundColor: statusBg, color: statusColor, fontSize: '0.65rem' }} 
              />
              <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>
                Created on {invoice.invoice_date || invoice.invoiceDate || 'N/A'}
              </Typography>
            </Stack>
          </Box>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button 
            variant="outlined" 
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{ borderRadius: '12px', fontWeight: 700, textTransform: 'none' }}
          >
            Print
          </Button>
          <Button 
            variant="contained" 
            startIcon={<EditIcon />}
            component={Link}
            href={`/sales/invoices/edit/${id}`}
            className="no-print"
            sx={{ borderRadius: '12px', fontWeight: 800, textTransform: 'none', px: 3 }}
          >
            Edit
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 5, borderRadius: '32px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
            {/* Header Section */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 6 }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 900, color: theme.palette.primary.main, mb: 1 }}>
                  Hexonics POS
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  123 Business Avenue, Tech Park<br />
                  Bangalore, Karnataka - 560001<br />
                  GSTIN: 29ABCDE1234F1Z5
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>BILL TO</Typography>
                <Typography sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                  {invoice.party_name || invoice.partyName || invoice.customer_name || 'Walk-in Customer'}
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  {invoice.party_mobile || invoice.partyMobile || invoice.customer_phone || ''}<br />
                  Payment Terms: {invoice.payment_terms || invoice.paymentTerms || '0'} Days<br />
                  Due Date: {invoice.due_date || invoice.dueDate || 'N/A'}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 4, borderStyle: 'dashed' }} />

            {/* Items Table */}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>Item Description</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>Qty</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>Price</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>Tax</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(invoice.items || invoice.Items)?.map((item: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell sx={{ py: 2.5 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.product_name || item.name || item.ProductName}</Typography>
                        <Typography sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>HSN: {item.hsn_code || item.hsnCode || 'N/A'}</Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>{item.quantity || item.qty || item.Quantity}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>₹{(item.unit_price || item.price || item.UnitPrice || 0).toLocaleString()}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>{item.tax_rate || item.taxRate || item.TaxRate || 0}%</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800 }}>₹{(item.amount || item.Amount || 0).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Totals Section */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
              <Box sx={{ width: '300px' }}>
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ color: '#64748b', fontWeight: 600 }}>Subtotal</Typography>
                    <Typography sx={{ fontWeight: 700 }}>₹{(invoice.subtotal || invoice.subTotal || 0).toLocaleString()}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ color: '#64748b', fontWeight: 600 }}>Taxable Amount</Typography>
                    <Typography sx={{ fontWeight: 700 }}>₹{(invoice.taxable_amount || invoice.taxableAmount || 0).toLocaleString()}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ color: '#64748b', fontWeight: 600 }}>Total GST</Typography>
                    <Typography sx={{ fontWeight: 700 }}>+₹{(invoice.total_tax || invoice.taxAmount || invoice.totalTax || 0).toLocaleString()}</Typography>
                  </Box>
                  {(invoice.charges || invoice.Charges || (invoice as any).additionalCharges)?.map((charge: any, i: number) => (
                    <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ color: '#64748b', fontWeight: 600 }}>{charge.label || charge.Label || 'Charge'}</Typography>
                      <Typography sx={{ fontWeight: 700 }}>+₹{(charge.amount || charge.Amount || 0).toLocaleString()}</Typography>
                    </Box>
                  ))}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ color: '#64748b', fontWeight: 600 }}>Discount</Typography>
                    <Typography sx={{ fontWeight: 700, color: '#ef4444' }}>-₹{(invoice.total_discount || invoice.discountAmount || invoice.totalDiscount || 0).toLocaleString()}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ color: '#94a3b8', fontWeight: 500, fontSize: '0.85rem' }}>Round Off</Typography>
                    <Typography sx={{ fontWeight: 500, color: '#94a3b8', fontSize: '0.85rem' }}>{(invoice.round_off || invoice.roundOff || 0).toFixed(2)}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 900 }}>Total</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: theme.palette.primary.main }}>
                      ₹{(invoice.grand_total || invoice.grandTotal || 0).toLocaleString()}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Box>

            <Box sx={{ mt: 8 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Notes</Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.9rem', fontStyle: 'italic' }}>
                {invoice.notes || 'No notes provided for this invoice.'}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }} className="no-print">
          <Stack spacing={3}>
            <Paper sx={{ p: 4, borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Payment Info</Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Method</Typography>
                  <Typography sx={{ fontWeight: 700 }}>{invoice.payment_method || invoice.paymentMethod || 'N/A'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Paid Amount</Typography>
                  <Typography sx={{ fontWeight: 700, color: '#10b981' }}>₹{(invoice.paid_amount || invoice.paidAmount || 0).toLocaleString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Balance</Typography>
                  <Typography sx={{ fontWeight: 700, color: (invoice.balance_amount || invoice.balanceAmount || 0) > 0 ? '#f59e0b' : '#10b981' }}>
                    ₹{(invoice.balance_amount || invoice.balanceAmount || 0).toLocaleString()}
                  </Typography>
                </Box>
                <Button 
                  variant="contained" 
                  fullWidth 
                  sx={{ mt: 2, borderRadius: '12px', fontWeight: 800 }}
                  disabled={(invoice.balance_amount || invoice.balanceAmount || 0) === 0}
                >
                  Record Payment
                </Button>
              </Stack>
            </Paper>

            <Paper sx={{ p: 4, borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Quick Actions</Typography>
              <Stack spacing={2}>
                <Button variant="outlined" fullWidth startIcon={<ShareIcon />} sx={{ borderRadius: '12px', justifyContent: 'flex-start', px: 2, fontWeight: 700 }}>
                  Share on WhatsApp
                </Button>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  startIcon={<FileDownloadIcon />} 
                  onClick={handlePrint}
                  sx={{ borderRadius: '12px', justifyContent: 'flex-start', px: 2, fontWeight: 700 }}
                >
                  Download PDF
                </Button>
                <Button variant="outlined" color="error" fullWidth sx={{ borderRadius: '12px', justifyContent: 'flex-start', px: 2, fontWeight: 700 }}>
                  Cancel Invoice
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
