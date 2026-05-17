'use client';

import * as React from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  alpha,
  useTheme,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FilterListIcon from '@mui/icons-material/FilterList';
import HistoryIcon from '@mui/icons-material/History';
import { db, AuditLog } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { format } from 'date-fns';

export default function AuditLogPage() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [actionFilter, setActionFilter] = React.useState('ALL');
  const [entityFilter, setEntityFilter] = React.useState('ALL');
  const [selectedLog, setSelectedLog] = React.useState<AuditLog | null>(null);
  const [openDetailDialog, setOpenDetailDialog] = React.useState(false);

  // Fetch audit logs sorted by timestamp descending
  const auditLogs = useLiveQuery(() => 
    db.auditLogs.orderBy('timestamp').reverse().toArray()
  ) || [];

  const entityTypes = React.useMemo(() => {
    const types = new Set(auditLogs.map(log => log.entityType));
    return Array.from(types).sort();
  }, [auditLogs]);

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.entityId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entityType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    const matchesEntity = entityFilter === 'ALL' || log.entityType === entityFilter;

    return matchesSearch && matchesAction && matchesEntity;
  });

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setOpenDetailDialog(true);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'success';
      case 'UPDATE': return 'info';
      case 'DELETE': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e293b', letterSpacing: '-1px', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <HistoryIcon sx={{ fontSize: 35, color: theme.palette.primary.main }} />
            Audit Logs
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, mt: 0.5 }}>
            Monitor all system activities and data modifications
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ p: 2, borderRadius: '20px', mb: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
        <GridContainer>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              placeholder="Search by ID, Entity, or User..."
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ 
                width: { xs: '100%', md: 300 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc'
                }
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#94a3b8' }} />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Action</InputLabel>
              <Select
                value={actionFilter}
                label="Action"
                onChange={(e) => setActionFilter(e.target.value)}
                sx={{ borderRadius: '12px' }}
              >
                <MenuItem value="ALL">All Actions</MenuItem>
                <MenuItem value="CREATE">Create</MenuItem>
                <MenuItem value="UPDATE">Update</MenuItem>
                <MenuItem value="DELETE">Delete</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Entity Type</InputLabel>
              <Select
                value={entityFilter}
                label="Entity Type"
                onChange={(e) => setEntityFilter(e.target.value)}
                sx={{ borderRadius: '12px' }}
              >
                <MenuItem value="ALL">All Entities</MenuItem>
                {entityTypes.map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button 
              startIcon={<FilterListIcon />} 
              variant="outlined" 
              sx={{ borderRadius: '12px', color: '#64748b', borderColor: '#e2e8f0' }}
              onClick={() => {
                setSearchQuery('');
                setActionFilter('ALL');
                setEntityFilter('ALL');
              }}
            >
              Reset Filters
            </Button>
          </Box>
        </GridContainer>
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ backgroundColor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>Timestamp</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>User</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>Action</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>Entity Type</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>Entity ID</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>IP Address</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, color: '#64748b' }}>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                  <Box sx={{ opacity: 0.5 }}>
                    <HistoryIcon sx={{ fontSize: 60, mb: 2, color: '#cbd5e1' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>No audit logs found</Typography>
                    <Typography variant="body2">Try adjusting your filters or search query</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>
                    {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }} component="div">
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: theme.palette.primary.main }} />
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>{log.user}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={log.action} 
                      size="small" 
                      color={getActionColor(log.action) as any}
                      sx={{ fontWeight: 800, fontSize: '0.7rem', borderRadius: '8px' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'capitalize' }}>
                      {log.entityType}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, color: '#64748b', bgcolor: '#f1f5f9', p: 0.5, borderRadius: '4px', display: 'inline-block' }}>
                      {log.entityId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem' }}>{log.ip || 'Local'}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleViewDetails(log)} sx={{ color: theme.palette.primary.main }}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Detail Dialog */}
      <Dialog 
        open={openDetailDialog} 
        onClose={() => setOpenDetailDialog(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: '24px', p: 1 }
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Audit Log Details</Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>Log ID: {selectedLog?.id}</Typography>
          </Box>
          <Chip 
            label={selectedLog?.action} 
            color={getActionColor(selectedLog?.action || '') as any}
            sx={{ fontWeight: 800 }}
          />
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }} component="div">
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Event Information
              </Typography>
              <Paper sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: '16px' }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700 }}>Timestamp</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedLog && format(new Date(selectedLog.timestamp), 'PPP p')}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700 }}>User</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedLog?.user}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700 }}>Entity Type</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>{selectedLog?.entityType}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700 }}>Entity ID</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedLog?.entityId}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700 }}>IP Address</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedLog?.ip || 'N/A'}</Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Box>

            {selectedLog?.action === 'UPDATE' && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Changes
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 800, mb: 1, display: 'block' }}>BEFORE</Typography>
                    <Paper sx={{ p: 2, bgcolor: '#fef2f2', borderRadius: '16px', overflow: 'auto', maxHeight: 300 }}>
                      <pre style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600 }}>
                        {JSON.stringify(selectedLog.oldValue, null, 2)}
                      </pre>
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 800, mb: 1, display: 'block' }}>AFTER</Typography>
                    <Paper sx={{ p: 2, bgcolor: '#ecfdf5', borderRadius: '16px', overflow: 'auto', maxHeight: 300 }}>
                      <pre style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600 }}>
                        {JSON.stringify(selectedLog.newValue, null, 2)}
                      </pre>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}

            {(selectedLog?.action === 'CREATE' || selectedLog?.action === 'DELETE') && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {selectedLog.action === 'CREATE' ? 'Data Created' : 'Data Deleted'}
                </Typography>
                <Paper sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: '16px', overflow: 'auto', maxHeight: 400 }}>
                  <pre style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600 }}>
                    {JSON.stringify(selectedLog.action === 'CREATE' ? selectedLog.newValue : selectedLog.oldValue, null, 2)}
                  </pre>
                </Paper>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button fullWidth variant="contained" onClick={() => setOpenDetailDialog(false)} sx={{ borderRadius: '12px', fontWeight: 800 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function GridContainer({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
      {children}
    </Box>
  );
}
