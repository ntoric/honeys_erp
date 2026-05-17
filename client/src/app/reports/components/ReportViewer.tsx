'use client';

import * as React from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  TextField,
  MenuItem,
  IconButton,
  alpha,
  useTheme,
  Breadcrumbs,
  Grid,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid';
import {
  Download as DownloadIcon,
  FilterList as FilterListIcon,
  PictureAsPdf as PdfIcon,
  TableChart as TableIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { format } from 'date-fns';

interface ReportViewerProps {
  title: string;
  columns: GridColDef[];
  data: any[];
  isLoading?: boolean;
  onFilterChange?: (filters: any) => void;
  exportTypes?: ('csv' | 'pdf' | 'xlsx')[];
}

function CustomToolbar() {
  return (
    <GridToolbarContainer sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
      <Box sx={{ width: 300 }}>
        <GridToolbarQuickFilter 
          slotProps={{
            root: {
              sx: {
                borderRadius: '12px',
                backgroundColor: '#f8fafc',
                px: 2,
              }
            }
          } as any} 
        />
      </Box>
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <GridToolbarExport 
          slotProps={{
            button: {
              startIcon: <DownloadIcon />,
              sx: { borderRadius: '10px', textTransform: 'none', fontWeight: 700, border: '1px solid #e2e8f0' }
            }
          } as any}
        />
      </Box>
    </GridToolbarContainer>
  );
}

export default function ReportViewer({
  title,
  columns,
  data,
  isLoading = false,
  onFilterChange,
  exportTypes = ['csv', 'pdf', 'xlsx'],
}: ReportViewerProps) {
  const theme = useTheme();
  const [fromDate, setFromDate] = React.useState(format(new Date().setDate(1), 'yyyy-MM-dd'));
  const [toDate, setToDate] = React.useState(format(new Date(), 'yyyy-MM-dd'));

  const handleApplyFilters = () => {
    if (onFilterChange) {
      onFilterChange({ fromDate, toDate });
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs sx={{ mb: 1 }}>
          <Link href="/reports" style={{ textDecoration: 'none', color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>
            Reports
          </Link>
          <Typography sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.85rem' }}>{title}</Typography>
        </Breadcrumbs>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Link href="/reports" passHref>
              <IconButton sx={{ backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <ArrowBackIcon />
              </IconButton>
            </Link>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e293b', letterSpacing: '-1px' }}>
              {title}
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2} component="div">
            <Button 
              variant="contained" 
              startIcon={<PdfIcon />} 
              sx={{ 
                borderRadius: '12px', 
                textTransform: 'none', 
                fontWeight: 700, 
                backgroundColor: '#ef4444',
                '&:hover': { backgroundColor: '#dc2626' }
              }}
            >
              Export PDF
            </Button>
          </Stack>
        </Box>
      </Box>

      <Paper sx={{ p: 2, borderRadius: '20px', mb: 3, backgroundColor: '#ffffff', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <Grid container spacing={3} sx={{ alignItems: 'flex-end' }}>
          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <TextField
              label="From Date"
              type="date"
              fullWidth
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <TextField
              label="To Date"
              type="date"
              fullWidth
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <Button 
              variant="contained" 
              fullWidth 
              onClick={handleApplyFilters}
              sx={{ height: 56, borderRadius: '12px', fontWeight: 800 }}
            >
              Apply Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ height: 600, width: '100%', borderRadius: '24px', overflow: 'hidden', backgroundColor: '#ffffff', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
        <DataGrid
          rows={data}
          columns={columns}
          loading={isLoading}
          slots={{ toolbar: CustomToolbar }}
          disableRowSelectionOnClick
          getRowId={(row) => row.id || row.product_id || row.category || row.user_id || row.party_id || Math.random()}
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #f1f5f9',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 800,
              color: '#475569',
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #f8fafc',
              color: '#1e293b',
              fontWeight: 500,
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.02),
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: '1px solid #f1f5f9',
            }
          }}
        />
      </Paper>
    </Box>
  );
}
