'use client';

import * as React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Grid, 
  Stack, 
  Divider, 
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  alpha,
  useTheme,
  CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import EditIcon from '@mui/icons-material/Edit';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { OpenAPI } from '@/api/core/OpenAPI';
import { request as __request } from '@/api/core/request';
import Link from 'next/link';

export default function PurchaseInvoiceDetailPage() {
  const { id } = useParams();
  const theme = useTheme();
  const router = useRouter();

  const { data, isLoading, error } = useQuery({
    queryKey: ['purchase-invoice', id],
    queryFn: () => __request(OpenAPI, {
      method: 'GET',
      url: '/purchase/bills/{id}',
      path: { id: id as string }
    })
  });

  const invoice = data as any;

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>
  );

  if (error || !invoice) return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h5" color="error">Error loading invoice</Typography>
      <Button component={Link} href="/purchase/invoices" startIcon={<ArrowBackIcon />} sx={{ mt: 2 }}>
        Back to List
      </Button>
    </Box>
  );

  const statusStr = (invoice?.status || '').toLowerCase();
  const statusColor = statusStr === 'paid' ? '#10b981' : 
                     statusStr === 'unpaid' ? '#f59e0b' : '#64748b';

  return (
    <Box sx={{ maxWidth: '1000px', margin: '0 auto', pb: 10 }}>
      {/* Header Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, '@media print': { display: 'none' } }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <IconButton onClick={() => router.back()} sx={{ backgroundColor: '#ffffff' }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e293b', letterSpacing: '-1.5px' }}>
            Purchase Invoice Details
          </Typography>
        </Stack>
        <Stack direction="row" spacing={2}>
          <Button 
            variant="outlined" 
            startIcon={<PrintIcon />} 
            onClick={handlePrint}
            sx={{ borderRadius: '12px', fontWeight: 700 }}
          >
            Print
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />}
            onClick={handlePrint}
            className="no-print"
            sx={{ borderRadius: '12px', fontWeight: 700 }}
          >
            Download PDF
          </Button>
          <Button 
            variant="contained" 
            startIcon={<EditIcon />}
            component={Link}
            href={`/purchase/invoices/edit/${id}`}
            className="no-print"
            sx={{ borderRadius: '12px', fontWeight: 800 }}
          >
            Edit
          </Button>
        </Stack>
      </Box>

      {/* Main Invoice Content */}
      <Paper sx={{ p: 6, borderRadius: '24px', boxShadow: '0 4px 24px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
        <Grid container spacing={4}>
          {/* Company Info (Mock or from Settings) */}
          <Grid size={{ xs: 6 }}>
            <Typography variant="h5" sx={{ fontWeight: 900, color: theme.palette.primary.main, mb: 1 }}>
              MARIO POS
            </Typography>
            <Typography sx={{ color: '#64748b', fontSize: '0.9rem' }}>
              Your Business Address Line 1<br />
              City, State, Zip Code<br />
              Phone: +91 98765 43210
            </Typography>
          </Grid>

          {/* Invoice Meta */}
          <Grid size={{ xs: 6 }} sx={{ textAlign: 'right' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
              PURCHASE INVOICE
            </Typography>
            <Typography sx={{ fontWeight: 700, color: '#1e293b' }}>
              #{invoice.invoice_no || invoice.bill_no || invoice.invoiceNo || invoice.billNo || 'N/A'}
            </Typography>
            <Chip 
              label={(invoice.status || 'DRAFT').toUpperCase()} 
              sx={{ 
                mt: 1, 
                fontWeight: 800, 
                backgroundColor: alpha(statusColor, 0.1), 
                color: statusColor,
                fontSize: '0.7rem'
              }} 
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          {/* Bill From / Bill To */}
          <Grid size={{ xs: 6 }}>
            <Typography sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', mb: 1.5 }}>
              Vendor Details
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
              {invoice.party_name || invoice.partyName || 'Unknown Vendor'}
            </Typography>
            <Typography sx={{ color: '#64748b', fontSize: '0.9rem' }}>
              Mobile: {invoice.party_mobile || invoice.partyMobile || 'N/A'}<br />
              ID: {invoice.party_id || invoice.partyId || 'N/A'}
            </Typography>
          </Grid>

          <Grid size={{ xs: 6 }} sx={{ textAlign: 'right' }}>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Typography sx={{ color: '#64748b' }}>Invoice Date:</Typography>
                <Typography sx={{ fontWeight: 600 }}>{invoice.invoice_date || invoice.bill_date || invoice.invoiceDate || invoice.billDate || 'N/A'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Typography sx={{ color: '#64748b' }}>Due Date:</Typography>
                <Typography sx={{ fontWeight: 600 }}>{invoice.due_date || invoice.dueDate || 'N/A'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Typography sx={{ color: '#64748b' }}>Payment Terms:</Typography>
                <Typography sx={{ fontWeight: 600 }}>{invoice.payment_terms || invoice.paymentTerms || '0'} Days</Typography>
              </Box>
            </Stack>
          </Grid>

          {/* Items Table */}
          <Grid size={{ xs: 12 }} sx={{ mt: 4 }}>
            <TableContainer sx={{ borderRadius: '16px', border: '1px solid #f1f5f9' }}>
              <Table>
                <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Item Details</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#64748b' }} align="right">Qty</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#64748b' }} align="right">Price</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#64748b' }} align="right">Tax</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#64748b' }} align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(invoice.items || invoice.Items)?.map((item: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ py: 2.5 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.product_name || item.ProductName || item.name}</Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>Barcode: {item.barcode || item.Barcode || 'N/A'}</Typography>
                      </TableCell>
                      <TableCell align="right">{item.quantity || item.Quantity || item.qty}</TableCell>
                      <TableCell align="right">₹{(item.unit_price || item.UnitPrice || item.price || 0).toLocaleString()}</TableCell>
                      <TableCell align="right">{item.tax_rate || item.TaxRate || item.taxRate || 0}%</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800 }}>₹{(item.amount || item.Amount || 0).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {/* Summary */}
          <Grid size={{ xs: 12, md: 5 }} sx={{ ml: 'auto', mt: 4 }}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ color: '#64748b' }}>Subtotal</Typography>
                <Typography sx={{ fontWeight: 600 }}>₹{(invoice.subtotal || invoice.subTotal || 0).toLocaleString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ color: '#64748b' }}>Total Tax</Typography>
                <Typography sx={{ fontWeight: 600 }}>+₹{(invoice.total_tax || invoice.totalTax || 0).toLocaleString()}</Typography>
              </Box>
              {(invoice.charges || invoice.Charges)?.map((charge: any, idx: number) => (
                <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ color: '#64748b' }}>{charge.label || charge.Label || 'Charge'}</Typography>
                  <Typography sx={{ fontWeight: 600 }}>+₹{(charge.amount || charge.Amount || 0).toLocaleString()}</Typography>
                </Box>
              ))}
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ color: '#64748b' }}>Discount</Typography>
                <Typography sx={{ fontWeight: 600, color: '#ef4444' }}>-₹{(invoice.total_discount || invoice.totalDiscount || 0).toLocaleString()}</Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>Total</Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: theme.palette.primary.main }}>
                  ₹{(invoice.grand_total || invoice.grandTotal || 0).toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ p: 2, backgroundColor: alpha(theme.palette.primary.main, 0.05), borderRadius: '12px', mt: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>Paid Amount</Typography>
                  <Typography sx={{ fontWeight: 800, color: '#10b981' }}>₹{(invoice.paid_amount || invoice.paidAmount || 0).toLocaleString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>Balance Due</Typography>
                  <Typography sx={{ fontWeight: 800, color: '#ef4444' }}>₹{(invoice.balance_amount || invoice.balanceAmount || 0).toLocaleString()}</Typography>
                </Box>
              </Box>
            </Stack>
          </Grid>

          {/* Notes */}
          <Grid size={{ xs: 12 }} sx={{ mt: 4 }}>
            <Typography sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', mb: 1 }}>
              Notes / Terms
            </Typography>
            <Typography sx={{ color: '#64748b', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
              {invoice.notes || 'No special notes for this invoice.'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
