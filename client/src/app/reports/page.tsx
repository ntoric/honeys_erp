'use client';

import * as React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Tabs,
  Tab,
  Card,
  CardContent,
  IconButton,
  Button,
  Stack,
  alpha,
  useTheme,
  Divider,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  ShoppingBag as ShoppingBagIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Assessment as AssessmentIcon,
  ArrowForwardIos as ArrowForwardIosIcon,
  Download as DownloadIcon,
  FilterList as FilterListIcon,
  AccountBalance as AccountBalanceIcon,
  LocalShipping as LocalShippingIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import Link from 'next/link';

// Mock Data for Dashboard
const salesData = [
  { name: 'Mon', sales: 4000, profit: 2400 },
  { name: 'Tue', sales: 3000, profit: 1398 },
  { name: 'Wed', sales: 2000, profit: 9800 },
  { name: 'Thu', sales: 2780, profit: 3908 },
  { name: 'Fri', sales: 1890, profit: 4800 },
  { name: 'Sat', sales: 2390, profit: 3800 },
  { name: 'Sun', sales: 3490, profit: 4300 },
];

const categoryData = [
  { name: 'Electronics', value: 400 },
  { name: 'Grocery', value: 300 },
  { name: 'Clothing', value: 300 },
  { name: 'Home Appliances', value: 200 },
];

const COLORS = ['#4c3bcf', '#00c49f', '#ffbb28', '#ff8042'];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`reports-tabpanel-${index}`}
      aria-labelledby={`reports-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const reportCategories = [
  {
    title: 'Sales Reports',
    icon: <ShoppingBagIcon />,
    color: '#4c3bcf',
    reports: [
      { name: 'Sales Summary', path: '/reports/sales-summary', desc: 'Daily, weekly and monthly sales overview' },
      { name: 'Sales by Product', path: '/reports/sales-by-product', desc: 'Detailed performance of each product' },
      { name: 'Sales by Category', path: '/reports/sales-by-category', desc: 'Revenue breakdown by product categories' },
      { name: 'Sales by Customer', path: '/reports/sales-by-customer', desc: 'Insights into customer buying patterns' },
      { name: 'Sales by Cashier', path: '/reports/sales-by-cashier', desc: 'Performance tracking for staff members' },
    ]
  },
  {
    title: 'Inventory Reports',
    icon: <InventoryIcon />,
    color: '#0ea5e9',
    reports: [
      { name: 'Stock Valuation', path: '/reports/stock-valuation', desc: 'Current value of inventory on hand' },
      { name: 'Low Stock Alerts', path: '/reports/low-stock', desc: 'Items that need reordering immediately' },
      { name: 'Stock Movement', path: '/reports/stock-movement', desc: 'Detailed log of stock ins and outs' },
      { name: 'Expiry Alerts', path: '/reports/expiry-alert', desc: 'Batches approaching their expiry dates' },
    ]
  },
  {
    title: 'Financial Reports',
    icon: <AccountBalanceIcon />,
    color: '#10b981',
    reports: [
      { name: 'Profit & Loss', path: '/reports/pnl', desc: 'Summary of revenue, COGS and expenses' },
      { name: 'Customer Balances', path: '/reports/party-balance?type=customer', desc: 'Outstanding amounts from customers' },
      { name: 'Vendor Balances', path: '/reports/party-balance?type=vendor', desc: 'Pending payments to suppliers' },
      { name: 'Day Book', path: '/reports/day-book', desc: 'All transactions recorded for a specific day' },
    ]
  },
  {
    title: 'Tax & GST Reports',
    icon: <ReceiptIcon />,
    color: '#f59e0b',
    reports: [
      { name: 'GSTR-1 Summary', path: '/reports/gstr1', desc: 'Details of outward supplies for GST filing' },
      { name: 'GSTR-3B Summary', path: '/reports/gstr3b', desc: 'Monthly summary of sales and ITC' },
      { name: 'Tax Summary', path: '/reports/tax-summary', desc: 'Breakdown of taxes collected and paid' },
    ]
  }
];

export default function ReportsPage() {
  const theme = useTheme();
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e293b', letterSpacing: '-1px', mb: 0.5 }}>
            Business Intelligence & Reports
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 500 }}>
            Analyze your business performance with real-time data insights.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2} component="div">
          <Button 
            variant="outlined" 
            startIcon={<FilterListIcon />} 
            sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
          >
            Filters
          </Button>
          <Button 
            variant="contained" 
            startIcon={<DownloadIcon />} 
            sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, boxShadow: '0 8px 16px rgba(76, 59, 207, 0.2)' }}
          >
            Export All
          </Button>
        </Stack>
      </Box>

      <Paper sx={{ borderRadius: '16px', mb: 4, overflow: 'hidden', backgroundColor: 'transparent', boxShadow: 'none' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '1rem',
              minWidth: 160,
              py: 2,
            }
          }}
        >
          <Tab label="Overview" />
          <Tab label="Detailed Reports" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* KPI Cards */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper sx={{ p: 2.5, borderRadius: '20px', backgroundColor: '#ffffff', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ p: 1, borderRadius: '12px', backgroundColor: alpha('#4c3bcf', 0.1), color: '#4c3bcf', display: 'flex' }}>
                    <TrendingUpIcon />
                  </Box>
                  <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 800, backgroundColor: alpha('#10b981', 0.1), px: 1, py: 0.5, borderRadius: '6px' }}>
                    +12.5%
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5 }}>₹1,24,500</Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>Today's Gross Sales</Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper sx={{ p: 2.5, borderRadius: '20px', backgroundColor: '#ffffff', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ p: 1, borderRadius: '12px', backgroundColor: alpha('#10b981', 0.1), color: '#10b981', display: 'flex' }}>
                    <TrendingUpIcon />
                  </Box>
                  <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 800, backgroundColor: alpha('#10b981', 0.1), px: 1, py: 0.5, borderRadius: '6px' }}>
                    +8.2%
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5 }}>₹34,200</Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>Today's Net Profit</Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper sx={{ p: 2.5, borderRadius: '20px', backgroundColor: '#ffffff', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ p: 1, borderRadius: '12px', backgroundColor: alpha('#0ea5e9', 0.1), color: '#0ea5e9', display: 'flex' }}>
                    <ShoppingBagIcon />
                  </Box>
                  <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 800, backgroundColor: alpha('#ef4444', 0.1), px: 1, py: 0.5, borderRadius: '6px' }}>
                    -2.4%
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5 }}>142</Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>Total Orders Today</Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper sx={{ p: 2.5, borderRadius: '20px', backgroundColor: '#ffffff', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ p: 1, borderRadius: '12px', backgroundColor: alpha('#f59e0b', 0.1), color: '#f59e0b', display: 'flex' }}>
                    <InventoryIcon />
                  </Box>
                  <Typography variant="caption" sx={{ color: '#f59e0b', fontWeight: 800, backgroundColor: alpha('#f59e0b', 0.1), px: 1, py: 0.5, borderRadius: '6px' }}>
                    12 Alerts
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5 }}>842</Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>Products in Stock</Typography>
              </Paper>
            </Grid>

            {/* Charts */}
            <Grid size={{ xs: 12, lg: 8 }}>
              <Paper sx={{ p: 3, borderRadius: '24px', backgroundColor: '#ffffff', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>Revenue vs Profit (Weekly)</Typography>
                  <Button size="small" variant="text" sx={{ fontWeight: 700 }}>View Full Report</Button>
                </Box>
                <Box sx={{ width: '100%', height: 350 }}>
                  <ResponsiveContainer>
                    <LineChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                      <ChartTooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                        itemStyle={{ fontWeight: 700 }}
                      />
                      <Line type="monotone" dataKey="sales" stroke="#4c3bcf" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, lg: 4 }}>
              <Paper sx={{ p: 3, borderRadius: '24px', backgroundColor: '#ffffff', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>Sales by Category</Typography>
                </Box>
                <Box sx={{ width: '100%', height: 350, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <Stack spacing={1} sx={{ width: '100%', mt: 2 }} component="div">
                    {categoryData.map((entry, index) => (
                      <Box key={entry.name} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ width: 12, height: 12, borderRadius: '3px', backgroundColor: COLORS[index] }} />
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569' }}>{entry.name}</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{((entry.value / 1200) * 100).toFixed(0)}%</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={4}>
            {reportCategories.map((category) => (
              <Grid size={{ xs: 12, md: 6 }} key={category.title}>
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ p: 1, borderRadius: '10px', backgroundColor: alpha(category.color, 0.1), color: category.color, display: 'flex' }}>
                    {category.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>{category.title}</Typography>
                </Box>
                <Paper sx={{ borderRadius: '20px', overflow: 'hidden', backgroundColor: '#ffffff', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                  <Stack divider={<Divider />} component="div">
                    {category.reports.map((report) => (
                      <Link key={report.name} href={report.path} passHref style={{ textDecoration: 'none' }}>
                        <Box
                          sx={{
                            p: 2.5,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              backgroundColor: alpha(category.color, 0.03),
                              '& .arrow-icon': { transform: 'translateX(4px)', color: category.color }
                            }
                          }}
                        >
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e293b', mb: 0.5 }}>
                              {report.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                              {report.desc}
                            </Typography>
                          </Box>
                          <ArrowForwardIosIcon className="arrow-icon" sx={{ fontSize: 16, color: '#cbd5e1', transition: 'all 0.2s' }} />
                        </Box>
                      </Link>
                    ))}
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
}
