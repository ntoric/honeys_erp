'use client';

import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material';
import { Category } from '@/api/models/Category';

interface CreateCategoryModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (category: Category) => void;
  initialData?: Category | null;
}

export default function CreateCategoryModal({
  open,
  onClose,
  onSave,
  initialData,
}: CreateCategoryModalProps) {
  const [formData, setFormData] = React.useState<Category>({
    name: '',
    sku: '',
    is_active: true,
  });

  React.useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        sku: '',
        is_active: true,
      });
    }
  }, [initialData, open]);

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 800 }}>
        {initialData ? 'Edit Category' : 'Create New Category'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <TextField
            label="Category Name"
            fullWidth
            required
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            variant="outlined"
          />
          <TextField
            label="SKU / Code"
            fullWidth
            value={formData.sku || ''}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            variant="outlined"
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.is_active !== false}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                color="primary"
              />
            }
            label={
              <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                Active Status
              </Typography>
            }
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} sx={{ fontWeight: 700, color: '#64748b' }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!formData.name}
          sx={{ borderRadius: '10px', fontWeight: 700, px: 3 }}
        >
          {initialData ? 'Save Changes' : 'Create Category'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
