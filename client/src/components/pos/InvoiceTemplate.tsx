'use client';

import * as React from 'react';
import { Box, Typography, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

interface InvoiceTemplateProps {
  data: any;
  printerSize?: '2inch' | '3inch';
}

export const InvoiceTemplate = React.forwardRef<HTMLDivElement, InvoiceTemplateProps>(({ data, printerSize = '3inch' }, ref) => {
  const width = printerSize === '2inch' ? '58mm' : '80mm';
  
  return (
    <Box 
      ref={ref}
      sx={{ 
        width, 
        padding: '5mm', 
        backgroundColor: '#fff', 
        color: '#000',
        fontFamily: 'monospace',
        fontSize: '12px',
        lineHeight: 1.2
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 900, textTransform: 'uppercase' }}>
          Hexonics Retail
        </Typography>
        <Typography variant="body2">123 Business Park, Bangalore</Typography>
        <Typography variant="body2">GSTIN: 29ABCDE1234F1Z5</Typography>
        <Typography variant="body2">Mob: +91 9876543210</Typography>
      </Box>

      <Divider sx={{ borderStyle: 'dashed', my: 1 }} />

      <Box sx={{ mb: 1 }}>
        <Typography variant="body2">Inv: {data.invoiceNo}</Typography>
        <Typography variant="body2">Date: {new Date(data.invoiceDate).toLocaleString()}</Typography>
        <Typography variant="body2">Cust: {data.partyName || 'Cash'}</Typography>
        {data.partyGstin && <Typography variant="body2">GSTIN: {data.partyGstin}</Typography>}
        {data.partyMobile && <Typography variant="body2">Mob: {data.partyMobile}</Typography>}
        {data.partyAddress && <Typography variant="body2" sx={{ maxWidth: '100%', fontSize: '10px' }}>Addr: {data.partyAddress}</Typography>}
      </Box>

      <Divider sx={{ borderStyle: 'dashed', my: 1 }} />

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <thead>
          <tr style={{ borderBottom: '1px dashed #000' }}>
            <th style={{ textAlign: 'left', padding: '4px 0' }}>Item</th>
            <th style={{ textAlign: 'center', padding: '4px 0' }}>Qty</th>
            <th style={{ textAlign: 'right', padding: '4px 0' }}>Amt</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item: any, idx: number) => (
            <tr key={idx}>
              <td style={{ padding: '4px 0' }}>{item.name}</td>
              <td style={{ textAlign: 'center', padding: '4px 0' }}>{item.qty}</td>
              <td style={{ textAlign: 'right', padding: '4px 0' }}>{item.price * item.qty}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Divider sx={{ borderStyle: 'dashed', my: 1 }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2">Subtotal:</Typography>
          <Typography variant="body2">₹{data.subtotal.toFixed(2)}</Typography>
        </Box>
        {data.discountAmount > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2">Discount:</Typography>
            <Typography variant="body2">-₹{data.discountAmount.toFixed(2)}</Typography>
          </Box>
        )}
        {data.additionalCharges?.map((charge: any, i: number) => (
          <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2">{charge.label}:</Typography>
            <Typography variant="body2">+₹{charge.amount.toFixed(2)}</Typography>
          </Box>
        ))}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2">GST (18%):</Typography>
          <Typography variant="body2">₹{data.taxAmount.toFixed(2)}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, fontWeight: 900 }}>
          <Typography variant="body1" sx={{ fontWeight: 900 }}>TOTAL:</Typography>
          <Typography variant="body1" sx={{ fontWeight: 900 }}>₹{data.grandTotal.toFixed(2)}</Typography>
        </Box>
      </Box>

      {data.paymentMethod && (
        <Box sx={{ mt: 2 }}>
          <Divider sx={{ borderStyle: 'dotted', mb: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2">Mode:</Typography>
            <Typography variant="body2">{data.paymentMethod}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2">Received:</Typography>
            <Typography variant="body2">₹{data.receivedAmount?.toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2">Change:</Typography>
            <Typography variant="body2">₹{data.changeAmount?.toFixed(2)}</Typography>
          </Box>
        </Box>
      )}

      <Divider sx={{ borderStyle: 'dashed', my: 2 }} />

      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>Thank You for Shopping!</Typography>
        <Typography variant="body2">Visit Again</Typography>
        <Box sx={{ mt: 1, fontSize: '10px' }}>Powered by Hexonics</Box>
      </Box>
    </Box>
  );
});

InvoiceTemplate.displayName = 'InvoiceTemplate';
