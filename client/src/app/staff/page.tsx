'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Checkbox,
  Tooltip,
  alpha,
  useTheme,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Badge as BadgeIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Timelapse as TimelapseIcon,
  BeachAccess as BeachAccessIcon,
  Event as EventIcon,
  Payment as PaymentIcon,
  History as HistoryIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { StaffService, Staff, Attendance, SalaryPayment } from '@/api/services/StaffService';
import { toast } from 'sonner';
import { format } from 'date-fns';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

// --- Components ---

const StatCard = ({ title, value, icon, color, gradient }: any) => (
  <Card sx={{ 
    height: '100%', 
    borderRadius: '16px', 
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    background: gradient || '#ffffff',
    color: gradient ? '#ffffff' : 'inherit',
    border: 'none',
    overflow: 'hidden',
    position: 'relative'
  }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, opacity: gradient ? 0.8 : 0.6, mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {value}
          </Typography>
        </Box>
        <Box sx={{ 
          backgroundColor: gradient ? 'rgba(255,255,255,0.2)' : alpha(color, 0.1), 
          p: 1.5, 
          borderRadius: '12px',
          display: 'flex',
          color: gradient ? '#ffffff' : color
        }}>
          {icon}
        </Box>
      </Box>
      {gradient && (
        <Box sx={{ 
          position: 'absolute', 
          right: -20, 
          bottom: -20, 
          opacity: 0.1, 
          transform: 'rotate(-20deg)' 
        }}>
          {React.cloneElement(icon, { sx: { fontSize: 100 } })}
        </Box>
      )}
    </CardContent>
  </Card>
);

export default function StaffPayrollPage() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [summary, setSummary] = useState<Record<string, number>>({
    Present: 0, Absent: 0, 'Half Day': 0, 'Paid Leave': 0, 'Weekly Off': 0
  });
  const [search, setSearch] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);

  // Dialog States
  const [staffDialogOpen, setStaffDialogOpen] = useState(false);
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [paymentStaff, setPaymentStaff] = useState<Staff | null>(null);
  const [historyStaff, setHistoryStaff] = useState<Staff | null>(null);
  const [tempPassword, setTempPassword] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const staff = await StaffService.getStaff(search);
      setStaffList(staff);
      const today = format(new Date(), 'yyyy-MM-dd');
      const stats = await StaffService.getAttendanceSummary(today);
      setSummary({
        Present: stats.Present || 0,
        Absent: stats.Absent || 0,
        'Half Day': stats['Half Day'] || 0,
        'Paid Leave': stats['Paid Leave'] || 0,
        'Weekly Off': stats['Weekly Off'] || 0,
      });
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const handleToggleSelect = (id: string) => {
    setSelectedStaff(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedStaff(staffList.map(s => s.id));
    } else {
      setSelectedStaff([]);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedStaff.length === 0) return;
    try {
      await StaffService.postStaffBulkAction({ action, ids: selectedStaff });
      toast.success(`Bulk action ${action} completed`);
      fetchData();
      setSelectedStaff([]);
    } catch (error) {
      toast.error('Bulk action failed');
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this staff?')) return;
    try {
      await StaffService.deleteStaff(id);
      toast.success('Staff deleted');
      fetchData();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 }, width: '100%', maxWidth: '100vw', overflow: 'hidden' }}>
      <Box sx={{ 
        mb: 4, 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', md: 'flex-start' },
        gap: 2,
        mt: { xs: 2, md: 0 }
      }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e293b', mb: 1, fontSize: { xs: '1.75rem', md: '2.125rem' } }}>
            Staff & Payroll
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 500 }}>
            Manage your employees, attendance and monthly payroll.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <Button
            variant="outlined"
            startIcon={<EventIcon />}
            fullWidth
            onClick={() => setAttendanceDialogOpen(true)}
            sx={{ 
              borderRadius: '12px', 
              textTransform: 'none', 
              fontWeight: 700,
              borderColor: '#e2e8f0',
              color: '#64748b',
              height: { xs: 48, sm: 'auto' },
              '&:hover': { borderColor: theme.palette.primary.main, backgroundColor: alpha(theme.palette.primary.main, 0.05) }
            }}
          >
            Log Attendance
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            fullWidth
            onClick={() => { setEditingStaff(null); setStaffDialogOpen(true); }}
            sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, px: 3, height: { xs: 48, sm: 'auto' }, boxShadow: '0 8px 16px rgba(76, 59, 207, 0.2)' }}
          >
            Add Staff
          </Button>
        </Box>
      </Box>

      {/* Stats Widgets */}
      <Grid container spacing={2} sx={{ mb: 4 }} columns={10}>
        {[
          { title: 'Present', value: summary.Present, icon: <CheckCircleIcon />, color: '#10b981', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
          { title: 'Absent', value: summary.Absent, icon: <CancelIcon />, color: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' },
          { title: 'Half Day', value: summary['Half Day'], icon: <TimelapseIcon />, color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
          { title: 'Paid Leave', value: summary['Paid Leave'], icon: <BeachAccessIcon />, color: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' },
          { title: 'Weekly Off', value: summary['Weekly Off'], icon: <EventIcon />, color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' },
        ].map((item) => (
          <Grid key={item.title} size={{ xs: 10, sm: 5, md: 2 }}>
            <StatCard {...item} />
          </Grid>
        ))}
      </Grid>

      {/* List Table */}
      <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: 'none', overflow: 'hidden' }}>
        <Box sx={{ 
          p: 3, 
          borderBottom: '1px solid #f1f5f9', 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          justifyContent: 'space-between', 
          alignItems: { xs: 'stretch', md: 'center' },
          gap: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search staff..."
              size="small"
              fullWidth={{ xs: true, md: false } as any}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#94a3b8' }} />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: '10px', backgroundColor: '#f8fafc', '& fieldset': { borderColor: '#e2e8f0' } }
                }
              }}
              sx={{ width: { xs: '100%', md: 300 } }}
            />
            {selectedStaff.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', ml: { xs: 0, md: 2 } }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.primary.main, whiteSpace: 'nowrap' }}>
                  {selectedStaff.length} selected
                </Typography>
                <Button size="small" variant="text" color="error" onClick={() => handleBulkAction('delete')} sx={{ fontWeight: 700 }}>Delete</Button>
                <Button size="small" variant="text" onClick={() => handleBulkAction('activate')} sx={{ fontWeight: 700 }}>Activate</Button>
                <Button size="small" variant="text" onClick={() => handleBulkAction('deactivate')} sx={{ fontWeight: 700 }}>Deactivate</Button>
              </Box>
            )}
          </Box>
        </Box>
        <TableContainer sx={{ width: '100%', overflowX: 'auto' }}>
          <Table sx={{ minWidth: 700 }}>
            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedStaff.length > 0 && selectedStaff.length < staffList.length}
                    checked={staffList.length > 0 && selectedStaff.length === staffList.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Staff Name</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Salary</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#64748b' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : staffList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography variant="body1" sx={{ color: '#94a3b8' }}>No staff found</Typography>
                  </TableCell>
                </TableRow>
              ) : staffList.map((staff) => (
                <TableRow key={staff.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedStaff.includes(staff.id)}
                      onChange={() => handleToggleSelect(staff.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <BadgeIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
                      <Typography sx={{ fontWeight: 700, color: '#1e293b' }}>{staff.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={staff.role} 
                      size="small" 
                      sx={{ fontWeight: 600, backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '6px' }} 
                    />
                  </TableCell>
                  <TableCell sx={{ color: '#64748b', fontWeight: 500 }}>{staff.phone}</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#1e293b' }}>₹{staff.salary.toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={staff.is_active ? 'Active' : 'Inactive'}
                      size="small"
                      sx={{ 
                        fontWeight: 700, 
                        backgroundColor: staff.is_active ? alpha('#10b981', 0.1) : alpha('#64748b', 0.1),
                        color: staff.is_active ? '#059669' : '#475569',
                        borderRadius: '6px'
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                      <Tooltip title="History">
                        <IconButton size="small" onClick={() => { setHistoryStaff(staff); setHistoryDialogOpen(true); }}>
                          <HistoryIcon fontSize="small" sx={{ color: '#6366f1' }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Pay Salary">
                        <IconButton size="small" onClick={() => { setPaymentStaff(staff); setPaymentDialogOpen(true); }}>
                          <PaymentIcon fontSize="small" sx={{ color: '#059669' }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => { setEditingStaff(staff); setStaffDialogOpen(true); }}>
                          <EditIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleDeleteStaff(staff.id)}>
                          <DeleteIcon fontSize="small" sx={{ color: '#ef4444' }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add/Edit Staff Dialog */}
      <AddStaffDialog 
        open={staffDialogOpen} 
        onClose={() => setStaffDialogOpen(false)} 
        onSuccess={(pass?: string) => {
          fetchData();
          if (pass) setTempPassword(pass);
        }} 
        staff={editingStaff} 
      />

      {/* Log Attendance Dialog */}
      <LogAttendanceDialog 
        open={attendanceDialogOpen} 
        onClose={() => setAttendanceDialogOpen(false)} 
        onSuccess={fetchData} 
        staffList={staffList}
      />

      {/* Make Payment Dialog */}
      <MakePaymentDialog 
        open={paymentDialogOpen} 
        onClose={() => setPaymentDialogOpen(false)} 
        onSuccess={fetchData} 
        staff={paymentStaff} 
      />

      {/* Staff History Dialog */}
      <StaffHistoryDialog
        open={historyDialogOpen}
        onClose={() => setHistoryDialogOpen(false)}
        staff={historyStaff}
      />

      {/* Temporary Password Dialog */}
      <Dialog open={!!tempPassword} onClose={() => setTempPassword('')} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: '16px' } } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>User Account Created</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 3, fontWeight: 500 }}>
            A user account has been automatically created for this staff member. Please provide them with this temporary password.
          </Typography>
          <Box sx={{ p: 2, textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '12px', border: '2px dashed #e2e8f0' }}>
            <Typography variant="h4" sx={{ fontWeight: 900, color: theme.palette.primary.main, mb: 1, letterSpacing: '2px' }}>
              {tempPassword}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
              This password is valid for 24 hours only.
            </Typography>
            <Button
              startIcon={<ContentCopyIcon />}
              onClick={() => {
                navigator.clipboard.writeText(tempPassword);
                toast.success('Copied to clipboard');
              }}
              sx={{ mt: 2, fontWeight: 700 }}
            >
              Copy Password
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setTempPassword('')} variant="contained" fullWidth sx={{ borderRadius: '10px', fontWeight: 700 }}>
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

// --- Dialog Components ---

function AddStaffDialog({ open, onClose, onSuccess, staff }: any) {
  const [formData, setFormData] = useState<Partial<Staff>>({
    name: '', phone: '', email: '', role: '', salary: 0, joining_date: '', is_active: true
  });

  useEffect(() => {
    if (staff) {
      setFormData(staff);
    } else {
      setFormData({ 
        name: '', phone: '', email: '', role: '', salary: 0, 
        joining_date: format(new Date(), 'yyyy-MM-dd'), 
        is_active: true 
      });
    }
  }, [staff, open]);

  const handleSubmit = async () => {
    try {
      let result: any;
      if (staff) {
        result = await StaffService.putStaff(staff.id, formData);
      } else {
        result = await StaffService.postStaff(formData);
      }
      toast.success(staff ? 'Staff updated' : 'Staff added');
      onSuccess(result?.tempPassword);
      onClose();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: '16px' } } }}>
      <DialogTitle sx={{ fontWeight: 800 }}>{staff ? 'Edit Staff' : 'Add New Staff'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField label="Full Name" fullWidth value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          <TextField label="Phone Number" fullWidth value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
          <TextField label="Email Address" fullWidth value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
          <TextField label="Role / Designation" fullWidth value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} />
          <TextField label="Monthly Salary" type="number" fullWidth value={formData.salary} onChange={e => setFormData({ ...formData, salary: parseFloat(e.target.value) })} />
          <TextField label="Joining Date" type="date" fullWidth value={formData.joining_date} onChange={e => setFormData({ ...formData, joining_date: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} sx={{ color: '#64748b', fontWeight: 700 }}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" sx={{ borderRadius: '10px', fontWeight: 700, px: 3 }}>Save Staff</Button>
      </DialogActions>
    </Dialog>
  );
}

function LogAttendanceDialog({ open, onClose, onSuccess, staffList }: any) {
  const [date, setDate] = useState('');
  const [attendance, setAttendance] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (!date) setDate(format(new Date(), 'yyyy-MM-dd'));
      const fetchAttendance = async () => {
        const records = await StaffService.getAttendance({ date });
        const map: Record<string, string> = {};
        records.forEach(r => map[r.staff_id] = r.status);
        setAttendance(map);
      };
      fetchAttendance();
    }
  }, [open, date]);

  const handleStatusChange = (staffId: string, status: string) => {
    setAttendance(prev => ({ ...prev, [staffId]: status }));
  };

  const handleSubmit = async () => {
    const records = staffList.map((s: Staff) => ({
      staff_id: s.id,
      date,
      status: attendance[s.id] || 'Present',
      notes: ''
    }));
    try {
      await StaffService.postAttendance(records);
      toast.success('Attendance updated');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Update failed');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: '16px' } } }}>
      <DialogTitle sx={{ fontWeight: 800 }}>Daily Attendance</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3, pt: 1 }}>
          <TextField 
            label="Date" 
            type="date" 
            fullWidth 
            value={date} 
            onChange={e => setDate(e.target.value)} 
            slotProps={{ inputLabel: { shrink: true } }} 
          />
        </Box>
        <TableContainer sx={{ maxHeight: 400 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Staff Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {staffList.map((s: Staff) => (
                <TableRow key={s.id}>
                  <TableCell sx={{ fontWeight: 600 }}>{s.name}</TableCell>
                  <TableCell>
                    <Select
                      size="small"
                      value={attendance[s.id] || 'Present'}
                      onChange={(e) => handleStatusChange(s.id, e.target.value)}
                      sx={{ width: 140, borderRadius: '8px' }}
                    >
                      <MenuItem value="Present">Present</MenuItem>
                      <MenuItem value="Absent">Absent</MenuItem>
                      <MenuItem value="Half Day">Half Day</MenuItem>
                      <MenuItem value="Paid Leave">Paid Leave</MenuItem>
                      <MenuItem value="Weekly Off">Weekly Off</MenuItem>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} sx={{ color: '#64748b', fontWeight: 700 }}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" sx={{ borderRadius: '10px', fontWeight: 700, px: 3 }}>Save Attendance</Button>
      </DialogActions>
    </Dialog>
  );
}

function MakePaymentDialog({ open, onClose, onSuccess, staff }: any) {
  const [formData, setFormData] = useState<Partial<SalaryPayment>>({
    amount: 0, payment_mode: 'Cash', month: '', year: new Date().getFullYear(), payment_date: ''
  });

  useEffect(() => {
    if (open) {
      const now = new Date();
      const initialData = { 
        amount: staff?.salary || 0, 
        payment_mode: 'Cash', 
        month: format(now, 'MMMM'), 
        year: now.getFullYear(), 
        payment_date: format(now, 'yyyy-MM-dd'),
        staff_id: staff?.id
      };
      setFormData(initialData);
    }
  }, [staff, open]);

  const handleSubmit = async () => {
    try {
      await StaffService.postSalaryPayment(formData);
      toast.success('Payment recorded');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Payment failed');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: '16px' } } }}>
      <DialogTitle sx={{ fontWeight: 800 }}>Record Salary Payment</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#64748b' }}>
            Paying to: <span style={{ color: '#1e293b' }}>{staff?.name}</span>
          </Typography>
          <TextField label="Amount" type="number" fullWidth value={formData.amount} onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })} />
          <FormControl fullWidth>
            <InputLabel>Payment Mode</InputLabel>
            <Select label="Payment Mode" value={formData.payment_mode} onChange={e => setFormData({ ...formData, payment_mode: e.target.value })}>
              <MenuItem value="Cash">Cash</MenuItem>
              <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
              <MenuItem value="UPI">UPI</MenuItem>
              <MenuItem value="Cheque">Cheque</MenuItem>
            </Select>
          </FormControl>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Month</InputLabel>
                <Select label="Month" value={formData.month} onChange={e => setFormData({ ...formData, month: e.target.value })}>
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                    <MenuItem key={m} value={m}>{m}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField label="Year" type="number" fullWidth value={formData.year} onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })} />
            </Grid>
          </Grid>
          <TextField label="Payment Date" type="date" fullWidth value={formData.payment_date} onChange={e => setFormData({ ...formData, payment_date: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
          <TextField label="Reference / Notes" fullWidth value={formData.reference_no} onChange={e => setFormData({ ...formData, reference_no: e.target.value })} />
        </Box>
      </DialogContent>
    </Dialog>
  );
}

function StaffHistoryDialog({ open, onClose, staff }: any) {
  const theme = useTheme();
  const [history, setHistory] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (open && !startDate) {
      const now = new Date();
      setStartDate(format(new Date(now.getFullYear(), now.getMonth(), 1), 'yyyy-MM-dd'));
      setEndDate(format(now, 'yyyy-MM-dd'));
    }
  }, [open]);

  const fetchHistory = async () => {
    if (!staff) return;
    setLoading(true);
    try {
      const data = await StaffService.getAttendance({ staff_id: staff.id, start_date: startDate, end_date: endDate });
      setHistory(data || []);
    } catch (error) {
      toast.error('Failed to fetch history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && staff) fetchHistory();
  }, [open, staff, startDate, endDate]);

  const summary = history.reduce((acc: any, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {});

  const statusColors: any = {
    'Present': '#10b981',
    'Absent': '#ef4444',
    'Half Day': '#f59e0b',
    'Paid Leave': '#3b82f6',
    'Weekly Off': '#8b5cf6'
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth slotProps={{ paper: { sx: { borderRadius: '16px' } } }}>
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Attendance History</Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>Showing for {staff?.name}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField size="small" type="date" label="From" value={startDate} onChange={e => setStartDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
          <TextField size="small" type="date" label="To" value={endDate} onChange={e => setEndDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pb: 4 }}>
        <Grid container spacing={2} sx={{ mb: 3, mt: 1 }}>
          {Object.keys(statusColors).map(status => (
            <Grid key={status} size={{ xs: 6, sm: 2.4 }}>
              <Box sx={{ 
                p: 2, 
                borderRadius: '12px', 
                backgroundColor: alpha(statusColors[status], 0.1),
                border: `1px solid ${alpha(statusColors[status], 0.2)}`,
                textAlign: 'center'
              }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: statusColors[status] }}>{summary[status] || 0}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: statusColors[status], opacity: 0.8 }}>{status}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        <TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: 'none', border: '1px solid #f1f5f9' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={3} align="center" sx={{ py: 4 }}><CircularProgress size={24} /></TableCell></TableRow>
              ) : history.length === 0 ? (
                <TableRow><TableCell colSpan={3} align="center" sx={{ py: 4 }}><Typography variant="body2" sx={{ color: '#94a3b8' }}>No records found</Typography></TableCell></TableRow>
              ) : history.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{format(new Date(row.date), 'dd MMM yyyy')}</TableCell>
                  <TableCell>
                    <Chip 
                      label={row.status} 
                      size="small" 
                      sx={{ 
                        fontWeight: 700, 
                        backgroundColor: alpha(statusColors[row.status], 0.1), 
                        color: statusColors[row.status],
                        borderRadius: '6px'
                      }} 
                    />
                  </TableCell>
                  <TableCell sx={{ color: '#64748b' }}>{row.notes || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions sx={{ p: 3, borderTop: '1px solid #f1f5f9' }}>
        <Button onClick={onClose} variant="contained" sx={{ borderRadius: '10px', fontWeight: 700, px: 4 }}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
