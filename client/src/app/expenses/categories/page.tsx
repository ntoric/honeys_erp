'use client';

import * as React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  alpha,
  useTheme,
  Breadcrumbs
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CategoryIcon from '@mui/icons-material/Category';
import { ExpensesService } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ExpenseCategoriesPage() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [newCategoryName, setNewCategoryName] = React.useState('');

  const { data: categories, isLoading } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: () => ExpensesService.getExpensesCategories()
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => ExpensesService.postExpensesCategories({ name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
      toast.success('Category created');
      setIsDialogOpen(false);
      setNewCategoryName('');
    }
  });

  const handleCreate = () => {
    if (!newCategoryName.trim()) return;
    createMutation.mutate(newCategoryName);
  };

  return (
    <Box sx={{ maxWidth: '800px', margin: '0 auto' }}>
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
            <Link href="/expenses" style={{ textDecoration: 'none', color: 'inherit' }}>Expenses</Link>
            <Typography color="text.primary">Categories</Typography>
        </Breadcrumbs>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton component={Link} href="/expenses" sx={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', letterSpacing: '-0.5px' }}>
              Expense Categories
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsDialogOpen(true)}
            sx={{ borderRadius: '12px', fontWeight: 800, textTransform: 'none', px: 3 }}
          >
            Add Category
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 0, borderRadius: '16px', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>CATEGORY NAME</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>STATUS</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#64748b' }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={3} align="center">Loading...</TableCell></TableRow>
              ) : categories?.length === 0 ? (
                <TableRow><TableCell colSpan={3} align="center">No categories found</TableCell></TableRow>
              ) : categories?.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell sx={{ fontWeight: 600 }}>{cat.name}</TableCell>
                  <TableCell>
                    <Typography sx={{ color: '#10b981', fontWeight: 700, fontSize: '0.75rem' }}>ACTIVE</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton color="error" size="small">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 900 }}>Add New Category</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Category Name"
            fullWidth
            variant="outlined"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setIsDialogOpen(false)} sx={{ fontWeight: 700 }}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleCreate} 
            disabled={createMutation.isPending}
            sx={{ borderRadius: '10px', px: 4, fontWeight: 800 }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
