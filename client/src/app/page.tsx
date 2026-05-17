'use client';

import * as React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  useTheme,
  Button,
  alpha,
  IconButton,
  Avatar,
  Divider
} from '@mui/material';
import StatCard from '@/components/common/StatCard';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PaymentsIcon from '@mui/icons-material/Payments';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import SavingsIcon from '@mui/icons-material/Savings';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useSection } from '@/context/SectionContext';
import { db } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';

export default function Home() {
  const theme = useTheme();
  const { section } = useSection();
  const [metrics, setMetrics] = React.useState({
    toCollect: 0,
    toPay: 0,
    totalCash: 0,
    balance: 0,
    collectCount: 0,
    payCount: 0
  });
  const [latestTransactions, setLatestTransactions] = React.useState<any[]>([]);
  const [chartData, setChartData] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      // Fetch Parties for collect/pay metrics
      const parties = await db.parties.where('section').equals(section).toArray();
      const toCollect = parties.filter(p => p.party_type === 'customer').reduce((sum, p) => sum + (p.balance || 0), 0);
      const toPay = parties.filter(p => p.party_type === 'vendor').reduce((sum, p) => sum + (p.balance || 0), 0);
      const collectCount = parties.filter(p => p.party_type === 'customer' && p.balance > 0).length;
      const payCount = parties.filter(p => p.party_type === 'vendor' && p.balance > 0).length;

      // Fetch Bank Accounts for total cash
      const accounts = await db.bankAccounts.where('section').equals(section).toArray();
      const totalCash = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);

      setMetrics({
        toCollect,
        toPay,
        totalCash,
        balance: totalCash + toCollect - toPay,
        collectCount,
        payCount
      });

      // Fetch latest transactions (Sales + Purchases)
      const sales = await db.salesInvoices.where('section').equals(section).limit(10).toArray();
      const purchases = await db.purchaseInvoices.where('section').equals(section).limit(10).toArray();
      
      const allTx = [
        ...sales.map(s => ({ name: s.partyName, type: 'Income', amount: s.grandTotal, date: s.invoiceDate, color: '#16a34a' })),
        ...purchases.map(p => ({ name: p.partyName, type: 'Expense', amount: p.grandTotal, date: p.invoiceDate || (p as any).billDate, color: '#ef4444' }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
      
      setLatestTransactions(allTx);

      // Simple chart data from last 7 days sales
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentSales = await db.salesInvoices
        .where('section').equals(section)
        .filter(s => new Date(s.invoiceDate) >= sevenDaysAgo)
        .toArray();
      
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayTotal = recentSales
          .filter(s => s.invoiceDate.startsWith(dateStr))
          .reduce((sum, s) => sum + s.grandTotal, 0);
        days.push({ name: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), amount: dayTotal });
      }
      setChartData(days);
    };

    fetchData();
  }, [section]);

  const financialMetrics = [
    { 
      title: "To Collect", 
      value: formatCurrency(metrics.toCollect), 
      icon: <AccountBalanceWalletIcon />, 
      color: '#4c3bcf', 
      trend: '+0%',
      subtitle: `From ${metrics.collectCount} customers`
    },
    { 
      title: 'To Pay', 
      value: formatCurrency(metrics.toPay), 
      icon: <PaymentsIcon />, 
      color: '#ef4444', 
      trend: '-0%',
      subtitle: `To ${metrics.payCount} vendors`
    },
    { 
      title: 'Total Cash', 
      value: formatCurrency(metrics.totalCash), 
      icon: <CurrencyRupeeIcon />, 
      color: '#16a34a', 
      trend: '+0%',
      subtitle: 'Cash + Bank'
    },
    { 
      title: 'Balance', 
      value: formatCurrency(metrics.balance), 
      icon: <SavingsIcon />, 
      color: '#8b5cf6', 
      trend: '+0%',
      subtitle: 'Net Position'
    },
  ];

  return (
    <Box sx={{ flexGrow: 1, pb: 4 }}>
      {/* Header Section */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        gap: 2,
        mb: 4
      }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', letterSpacing: '-1px', mb: 0.5 }}>
            {section === 'retail' ? 'Retail Overview' : 'Wholesale Overview'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
            Welcome back! Here's what's happening in your {section} business today.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, width: { xs: '100%', sm: 'auto' } }}>
          <Button variant="outlined" sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, px: 2 }}>
            Download PDF
          </Button>
          <Button variant="contained" disableElevation sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, px: 3, backgroundColor: '#4c3bcf' }}>
            New Transaction
          </Button>
        </Box>
      </Box>

      {/* Financial Metrics Widgets */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {financialMetrics.map((metric, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title={metric.title}
              value={metric.value}
              icon={metric.icon}
              color={metric.color}
              trend={metric.trend}
              subtitle={metric.subtitle}
            />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: '16px', 
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
            border: '1px solid #f1f5f9',
            height: '100%'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                  Sales Report
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Revenue performance for the last 7 days
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'none' }}>Week</Button>
                <Button size="small" variant="contained" disableElevation sx={{ backgroundColor: alpha('#4c3bcf', 0.1), color: '#4c3bcf', fontWeight: 700, textTransform: 'none', borderRadius: '8px' }}>Month</Button>
              </Box>
            </Box>
            
            <Box sx={{ width: '100%', height: 320 }}>
              <ResponsiveContainer>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4c3bcf" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4c3bcf" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                    tickFormatter={(value) => `₹${value/1000}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                      fontWeight: 600
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#4c3bcf" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorAmount)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper sx={{ 
            borderRadius: '16px', 
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
            border: '1px solid #f1f5f9',
            overflow: 'hidden',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Box sx={{ p: 3, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                Latest Transactions
              </Typography>
              <IconButton size="small">
                <MoreVertIcon sx={{ fontSize: '1.25rem', color: '#64748b' }} />
              </IconButton>
            </Box>
            
            <Box sx={{ flexGrow: 1 }}>
              {latestTransactions.map((tx, i) => (
                <React.Fragment key={i}>
                  <Box sx={{ 
                    px: 3, 
                    py: 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    '&:hover': { backgroundColor: '#f8fafc' },
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ 
                        bgcolor: alpha(tx.color, 0.1), 
                        color: tx.color, 
                        width: 40, 
                        height: 40,
                        fontSize: '1rem',
                        fontWeight: 700,
                        borderRadius: '10px'
                      }}>
                        {tx.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>{tx.name}</Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>{new Date(tx.date).toLocaleDateString()}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography sx={{ fontWeight: 700, color: tx.color, fontSize: '0.875rem' }}>
                        {tx.type === 'Income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>{tx.type}</Typography>
                    </Box>
                  </Box>
                  {i < latestTransactions.length - 1 && <Divider sx={{ mx: 3, opacity: 0.5 }} />}
                </React.Fragment>
              ))}
              {latestTransactions.length === 0 && (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>No transactions found</Typography>
                </Box>
              )}
            </Box>
            
            <Box sx={{ p: 2, textAlign: 'center', borderTop: '1px solid #f1f5f9' }}>
              <Button size="small" sx={{ textTransform: 'none', fontWeight: 700, color: '#4c3bcf' }}>
                View All Transactions
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

