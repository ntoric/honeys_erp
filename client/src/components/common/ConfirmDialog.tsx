'use client';

import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
} from '@mui/material';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'success' | 'info';
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmColor = 'primary',
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            borderRadius: '20px',
            p: 1,
            width: '100%',
            maxWidth: '440px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          },
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, fontWeight: 900, color: '#1e293b', fontSize: '1.25rem', letterSpacing: '-0.3px' }}>
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500, lineHeight: 1.5 }}>
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 1, gap: 1 }}>
        <Button 
          onClick={onClose} 
          sx={{ 
            fontWeight: 700, 
            color: '#64748b',
            textTransform: 'none',
            fontSize: '0.85rem'
          }}
        >
          {cancelLabel}
        </Button>
        <Button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          variant="contained"
          color={confirmColor}
          sx={{ 
            borderRadius: '10px', 
            px: 3, 
            fontWeight: 800,
            textTransform: 'none',
            fontSize: '0.85rem',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            }
          }}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
