'use client';

import * as React from 'react';
import { 
  Box, Typography, Button, Paper, Grid, TextField, InputAdornment, MenuItem, 
  IconButton, Stack, alpha, useTheme, Autocomplete, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Switch, FormControlLabel, Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ExpensesService, PartiesService, Expense, ExpenseItem, Party } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import PartySelect from '@/components/common/PartySelect';

export default function ExpenseFormPage() {
  const theme = useTheme();
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const isEdit = !!params?.id;

  // Form State
  const [party, setParty] = React.useState<Party | null>(null);
  const [category, setCategory] = React.useState<any>(null);
  const [expenseNo, setExpenseNo] = React.useState('');
  const [date, setDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [originalInvoiceNo, setOriginalInvoiceNo] = React.useState('');
  const [paymentMode, setPaymentMode] = React.useState('Cash');
  const [notes, setNotes] = React.useState('');
  const [hasGst, setHasGst] = React.useState(false);
  const [items, setItems] = React.useState<ExpenseItem[]>([{ description: '', amount: 0 }]);

  // Queries
  const { data: categories } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: () => ExpensesService.getExpensesCategories()
  });


  const { data: existingExpense } = useQuery({
    queryKey: ['expense', params?.id],
    queryFn: () => ExpensesService.getExpenses1(params?.id as string),
    enabled: isEdit
  });

  React.useEffect(() => {
    if (existingExpense) {
      setExpenseNo(existingExpense.expense_no || '');
      setDate(existingExpense.date || '');
      setOriginalInvoiceNo(existingExpense.original_invoice_no || '');
      setPaymentMode(existingExpense.payment_mode || 'Cash');
      setNotes(existingExpense.notes || '');
      setHasGst(existingExpense.tax_inclusive || false);
      setItems(existingExpense.items || [{ description: '', amount: 0 }]);
      if (existingExpense.category_id) {
          setCategory({ id: existingExpense.category_id, name: existingExpense.category_name });
      }
      if (existingExpense.party_id) {
          setParty({ id: existingExpense.party_id, name: existingExpense.party_name } as any);
      }
    }
  }, [existingExpense]);

  const mutation = useMutation({
    mutationFn: (data: Expense) => isEdit ? ExpensesService.putExpenses(params?.id as string, data) : ExpensesService.postExpenses(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success(isEdit ? 'Expense updated' : 'Expense created');
      router.push('/expenses');
    }
  });

  const totalAmount = items.reduce((sum, item) => sum + (item.amount || 0), 0);

  const handleAddItem = () => setItems([...items, { description: '', amount: 0 }]);
  const handleRemoveItem = (index: number) => setItems(items.filter((_, i) => i !== index));
  const handleItemChange = (index: number, field: keyof ExpenseItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSave = () => {
    if (!category) return toast.error('Please select a category');
    if (items.length === 0 || items[0].description === '') return toast.error('Please add at least one item');

    const payload: Expense = {
      expense_no: expenseNo,
      date,
      party_id: party?.id,
      party_name: party?.name,
      category_id: category.id,
      category_name: category.name,
      amount: totalAmount,
      tax_inclusive: hasGst,
      original_invoice_no: originalInvoiceNo,
      payment_mode: paymentMode,
      notes,
      items
    };
    mutation.mutate(payload);
  };

  return (
    <Box sx={{ maxWidth: '900px', margin: '0 auto', pb: 10 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <IconButton component={Link} href="/expenses" sx={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>{isEdit ? 'Edit Expense' : 'Create Expense'}</Typography>
      </Box>

      <Paper sx={{ p: 4, borderRadius: '16px', border: '1px solid #f1f5f9', mb: 4 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControlLabel
              control={<Switch checked={hasGst} onChange={(e) => setHasGst(e.target.checked)} />}
              label={<Typography sx={{ fontWeight: 700 }}>Expense with GST</Typography>}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ textAlign: 'right' }}>
             <Button component={Link} href="/expenses/categories" size="small" sx={{ fontWeight: 700 }}>Manage Categories</Button>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6 }}>
            <Autocomplete
              options={categories || []}
              getOptionLabel={(option) => option.name || ''}
              value={category}
              onChange={(_, newValue) => setCategory(newValue)}
              renderInput={(params) => <TextField {...params} label="Expense Category" required fullWidth />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <PartySelect
              value={party}
              onChange={(newValue) => setParty(newValue)}
              label="Party / Vendor"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField label="Expense Number" fullWidth value={expenseNo} onChange={(e) => setExpenseNo(e.target.value)} placeholder="Auto Generated" />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField label="Original Invoice No" fullWidth value={originalInvoiceNo} onChange={(e) => setOriginalInvoiceNo(e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField label="Date" type="date" fullWidth value={date} onChange={(e) => setDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField select label="Payment Mode" fullWidth value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
              <MenuItem value="Cash">Cash</MenuItem>
              <MenuItem value="Bank">Bank Transfer</MenuItem>
              <MenuItem value="UPI">UPI</MenuItem>
              <MenuItem value="Card">Card</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Notes" fullWidth multiline rows={1} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Expense Items</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>DESCRIPTION</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">AMOUNT</TableCell>
                <TableCell align="center" width={50}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <TextField size="small" fullWidth value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} placeholder="Item description" />
                  </TableCell>
                  <TableCell align="right">
                    <TextField size="small" type="number" value={item.amount} onChange={(e) => handleItemChange(index, 'amount', parseFloat(e.target.value) || 0)} slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }} sx={{ width: 150 }} />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton color="error" onClick={() => handleRemoveItem(index)} disabled={items.length === 1}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Button startIcon={<AddIcon />} onClick={handleAddItem} sx={{ mt: 2, fontWeight: 700 }}>Add Item</Button>

        <Box sx={{ mt: 4, p: 3, backgroundColor: '#f8fafc', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Total Expense Amount</Typography>
          <Typography variant="h4" sx={{ fontWeight: 900, color: theme.palette.primary.main }}>₹{totalAmount.toLocaleString()}</Typography>
        </Box>

        <Stack direction="row" spacing={2} sx={{ mt: 4, justifyContent: 'flex-end' }}>
          <Button variant="outlined" component={Link} href="/expenses" sx={{ borderRadius: '10px', px: 4, fontWeight: 700 }}>Cancel</Button>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={mutation.isPending} sx={{ borderRadius: '10px', px: 6, fontWeight: 800 }}>
            {mutation.isPending ? 'Saving...' : 'Save Expense'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
