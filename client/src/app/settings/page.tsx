'use client';

import * as React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  CircularProgress
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { db, Settings } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { toast } from 'sonner';

export default function SettingsPage() {
  const settingsList = useLiveQuery(() => db.settings.toArray());
  
  const [formState, setFormState] = React.useState<{ [key: string]: any }>({});
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (settingsList) {
      const state: { [key: string]: any } = {};
      settingsList.forEach(s => {
        state[s.key] = s.value;
      });
      setFormState(state);
    }
  }, [settingsList]);

  const handleChange = (key: string, value: any) => {
    setFormState(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      for (const key in formState) {
        const existing = await db.settings.where('key').equals(key).first();
        if (existing) {
          await db.settings.update(existing.id, { value: formState[key] });
        } else {
          await db.settings.add({
            id: Math.random().toString(36).substring(2, 15),
            key,
            value: formState[key]
          });
        }
      }
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!settingsList) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a1a1a', letterSpacing: '-1px' }}>
          System Settings
        </Typography>
        <Button
          variant="contained"
          startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          onClick={handleSave}
          disabled={isSaving}
          sx={{ 
            px: 4, 
            py: 1.5, 
            borderRadius: '12px',
            backgroundColor: '#4c3bcf',
            fontWeight: 700,
            boxShadow: '0 10px 20px rgba(76, 59, 207, 0.2)'
          }}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 4, borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: '#1e293b' }}>
              Company Details
            </Typography>
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField 
                label="Company Name" 
                variant="outlined" 
                value={formState.companyName || 'Hexonics Retail'} 
                onChange={(e) => handleChange('companyName', e.target.value)}
                fullWidth 
              />
              <TextField 
                label="Legal Name" 
                variant="outlined" 
                value={formState.legalName || 'Hexonics Retail Pvt Ltd'} 
                onChange={(e) => handleChange('legalName', e.target.value)}
                fullWidth 
              />
              <TextField 
                label="GSTIN" 
                variant="outlined" 
                value={formState.gstin || '29ABCDE1234F1Z5'} 
                onChange={(e) => handleChange('gstin', e.target.value)}
                fullWidth 
              />
              <TextField 
                label="PAN" 
                variant="outlined" 
                value={formState.pan || 'ABCDE1234F'} 
                onChange={(e) => handleChange('pan', e.target.value)}
                fullWidth 
              />
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 4, borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: '#1e293b' }}>
              POS Configuration
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControlLabel 
                control={<Switch checked={formState.printOnSave ?? true} onChange={(e) => handleChange('printOnSave', e.target.checked)} color="primary" />} 
                label="Print Receipt on Save" 
              />
              <FormControlLabel 
                control={<Switch checked={formState.allowDiscount ?? true} onChange={(e) => handleChange('allowDiscount', e.target.checked)} color="primary" />} 
                label="Allow Discount" 
              />
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#64748b', mb: 1 }}>Printer & Peripherals</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField 
                    select 
                    label="Thermal Printer Size" 
                    fullWidth 
                    value={formState.printerSize || '3inch'}
                    onChange={(e) => handleChange('printerSize', e.target.value)}
                    slotProps={{ select: { native: true } }}
                  >
                    <option value="2inch">2 Inch (58mm)</option>
                    <option value="3inch">3 Inch (80mm)</option>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField 
                    label="Weighing Machine Prefix" 
                    variant="outlined" 
                    value={formState.weighingPrefix || '21'} 
                    onChange={(e) => handleChange('weighingPrefix', e.target.value)}
                    fullWidth 
                    helperText="Barcode Start Digits"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField 
                    label="Item Code Digits" 
                    type="number"
                    variant="outlined" 
                    value={formState.weighingItemCodeCount || 5} 
                    onChange={(e) => handleChange('weighingItemCodeCount', parseInt(e.target.value) || 0)}
                    fullWidth 
                    helperText="Digits for Item ID"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField 
                    label="Weight Digits" 
                    type="number"
                    variant="outlined" 
                    value={formState.weighingWeightCount || 5} 
                    onChange={(e) => handleChange('weighingWeightCount', parseInt(e.target.value) || 0)}
                    fullWidth 
                    helperText="Digits for Weight"
                  />
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              <TextField 
                label="Default Payment Mode" 
                variant="outlined" 
                value={formState.defaultPaymentMode || 'UPI'} 
                onChange={(e) => handleChange('defaultPaymentMode', e.target.value)}
                fullWidth 
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
