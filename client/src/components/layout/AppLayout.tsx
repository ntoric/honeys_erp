'use client';

import * as React from 'react';
import { styled, useTheme, alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptIcon from '@mui/icons-material/Receipt';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SettingsIcon from '@mui/icons-material/Settings';
import StoreIcon from '@mui/icons-material/Store';
import BadgeIcon from '@mui/icons-material/Badge';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SearchIcon from '@mui/icons-material/Search';
import AssessmentIcon from '@mui/icons-material/Assessment';
import InputBase from '@mui/material/InputBase';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Collapse from '@mui/material/Collapse';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CircularProgress from '@mui/material/CircularProgress';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Button from '@mui/material/Button';
import { useSection } from '@/context/SectionContext';
import { useStore } from '@/context/StoreContext';
import BusinessIcon from '@mui/icons-material/Business';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import StorefrontIcon from '@mui/icons-material/Storefront';

import { useAuth } from '@/context/AuthContext';

const drawerWidth = 240;

const openedMixin = (theme: any) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden' as const,
  borderRight: 'none',
});

const closedMixin = (theme: any) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden' as const,
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(10)} + 1px)`,
  },
  borderRight: 'none',
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 2),
  minHeight: 70,
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  backgroundColor: alpha('#f3f4f9', 0.8),
  backdropFilter: 'blur(8px)',
  boxShadow: 'none',
  border: 'none',
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })<{ open: boolean }>(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': {
        ...openedMixin(theme),
        backgroundColor: '#ffffff',
      },
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': {
        ...closedMixin(theme),
        backgroundColor: '#ffffff',
      },
    }),
  }),
);

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: 10,
  backgroundColor: '#ffffff',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
    minWidth: '320px',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#94a3b8',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: '#1e293b',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1.2, 1, 1.2, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    fontWeight: 500,
    fontSize: '0.85rem',
  },
}));

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/', permission: 'view_dashboard' },
  { text: 'Parties', icon: <PeopleIcon />, path: '/parties', permission: 'view_parties' },
  {
    text: 'Inventory',
    icon: <StoreIcon />,
    permission: 'view_inventory',
    children: [
      { text: 'Items', path: '/inventory/items', permission: 'view_inventory' },
      { text: 'Categories', path: '/inventory/categories', permission: 'view_inventory' },
    ]
  },
  { text: 'POS Billing', icon: <PointOfSaleIcon />, path: '/sales', permission: 'pos_billing' },
  {
    text: 'Sales',
    icon: <ShoppingCartIcon />,
    permission: 'view_sales',
    children: [
      { text: 'Sales Invoices', path: '/sales/invoices', permission: 'view_sales' },
      { text: 'Sales Returns', path: '/sales/returns', permission: 'view_sales' },
      { text: 'Payment In', path: '/sales/payments', permission: 'view_sales' },
    ]
  },
  {
    text: 'Purchase',
    icon: <LocalShippingIcon />,
    permission: 'view_purchase',
    children: [
      { text: 'Purchase Invoices', path: '/purchase/invoices', permission: 'view_purchase' },
      { text: 'Purchase Returns', path: '/purchase/returns', permission: 'view_purchase' },
      { text: 'Payment Out', path: '/purchase/payments', permission: 'view_purchase' },
    ]
  },
  { text: 'Expenses', icon: <ReceiptIcon />, path: '/expenses', permission: 'view_expenses' },
  { text: 'Staff & Payroll', icon: <BadgeIcon />, path: '/staff', permission: 'view_staff' },
  {
    text: 'Accounting',
    icon: <AccountBalanceWalletIcon />,
    permission: 'view_accounting',
    children: [
      { text: 'Cash & Bank', path: '/accounting/cash-bank', permission: 'view_accounting' },
      { text: 'Balance Sheet', path: '/accounting/balance-sheet', permission: 'view_accounting' },
      { text: 'Profit & Loss', path: '/accounting/pnl', permission: 'view_accounting' },
    ]
  },
  { text: 'Reports', icon: <AssessmentIcon />, path: '/reports', permission: 'view_reports' },
  {
    text: 'User Management',
    icon: <AdminPanelSettingsIcon />,
    permission: 'manage_users',
    children: [
      { text: 'Users', path: '/user-management/users', permission: 'manage_users' },
      { text: 'Roles & Permissions', path: '/user-management/roles', permission: 'manage_users' },
    ]
  },
  {
    text: 'Maintenance',
    icon: <BuildCircleIcon />,
    permission: 'manage_system',
    children: [
      { text: 'Stores', path: '/maintenance/stores', permission: 'manage_stores' },
      { text: 'Reset System', path: '/maintenance/reset', permission: 'manage_system' },
    ]
  },
  { text: 'Audit Log', icon: <ReceiptIcon />, path: '/audit', permission: 'view_audit_logs' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings', permission: 'view_settings' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const { user, logout, hasPermission, isLoading } = useAuth();
  const [open, setOpen] = React.useState(true);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [openMenus, setOpenMenus] = React.useState<Record<string, boolean>>({ 'Sales': true, 'Purchase': true, 'Accounting': true, 'Inventory': true });
  const pathname = usePathname();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { section, setSection } = useSection();
  const { currentStore, stores, switchStore } = useStore();
  const [storeAnchorEl, setStoreAnchorEl] = React.useState<null | HTMLElement>(null);

  React.useEffect(() => {
    if (pathname === '/sales') {
      Promise.resolve().then(() => {
        setOpen(false);
      });
    }
  }, [pathname]);

  if (pathname === '/login') {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f9' }}>
        <CircularProgress />
      </Box>
    );
  }

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (text: string) => {
    if (!open) {
      setOpen(true);
      setOpenMenus(prev => ({ ...prev, [text]: true }));
    } else {
      setOpenMenus(prev => ({ ...prev, [text]: !prev[text] }));
    }
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
  };

  const filteredMenuItems = menuItems.filter(item => {
    if (item.permission && !hasPermission(item.permission)) return false;
    return true;
  }).map(item => {
    if (item.children) {
      return {
        ...item,
        children: item.children.filter(child => !child.permission || hasPermission(child.permission))
      };
    }
    return item;
  });

  const drawerContent = (
    <>
      <DrawerHeader>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pl: 1 }}>
          <Box sx={{
            backgroundColor: theme.palette.primary.main,
            borderRadius: '12px',
            p: 0.8,
            display: 'flex',
            boxShadow: '0 8px 16px rgba(76, 59, 207, 0.2)'
          }}>
            <ReceiptIcon sx={{ color: '#ffffff', fontSize: 22 }} />
          </Box>
          {(open || mobileOpen) && (
            <Typography variant="h6" sx={{ fontWeight: 900, color: theme.palette.primary.main, letterSpacing: '-0.5px' }}>
              Hexonics
            </Typography>
          )}
        </Box>
      </DrawerHeader>
      <List sx={{ px: 2, mt: 1 }}>
        {filteredMenuItems.map((item) => {
          if (item.children) {
            const isAnyChildSelected = item.children.some(child => pathname === child.path);
            return (
              <React.Fragment key={item.text}>
                <ListItem disablePadding sx={{ display: 'block', mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => handleMenuClick(item.text)}
                    sx={{
                      minHeight: 48,
                      justifyContent: (open || mobileOpen) ? 'initial' : 'center',
                      px: 2,
                      borderRadius: '12px',
                      backgroundColor: (isAnyChildSelected && !(open || mobileOpen)) ? theme.palette.primary.main : 'transparent',
                      color: (isAnyChildSelected && !(open || mobileOpen)) ? '#ffffff' : '#64748b',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                        color: theme.palette.primary.main,
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 0, mr: (open || mobileOpen) ? 2 : 'auto', justifyContent: 'center', color: 'inherit' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} sx={{ opacity: (open || mobileOpen) ? 1 : 0 }} />
                    {(open || mobileOpen) && (openMenus[item.text] ? <ExpandLess /> : <ExpandMore />)}
                  </ListItemButton>
                </ListItem>
                <Collapse in={openMenus[item.text] && (open || mobileOpen)} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ pl: 2 }}>
                    {item.children.map((child) => {
                      const isSelected = pathname === child.path;
                      return (
                        <ListItem key={child.text} disablePadding sx={{ display: 'block', mb: 0.5 }}>
                          <Link href={child.path} passHref style={{ textDecoration: 'none', color: 'inherit' }}>
                            <ListItemButton
                              onClick={() => setMobileOpen(false)}
                              sx={{
                                minHeight: 44,
                                px: 2.5,
                                borderRadius: '12px',
                                backgroundColor: isSelected ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                                color: isSelected ? theme.palette.primary.main : '#64748b',
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                }
                              }}
                            >
                              <ListItemText
                                primary={child.text}
                                sx={{
                                  '& .MuiTypography-root': {
                                    fontWeight: isSelected ? 800 : 600,
                                    fontSize: '0.85rem'
                                  }
                                }}
                              />
                            </ListItemButton>
                          </Link>
                        </ListItem>
                      );
                    })}
                  </List>
                </Collapse>
              </React.Fragment>
            );
          }

          const isSelected = pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ display: 'block', mb: 0.5 }}>
              <Link href={item.path} passHref style={{ textDecoration: 'none', color: 'inherit' }}>
                <ListItemButton
                  onClick={() => setMobileOpen(false)}
                  sx={{
                    minHeight: 48,
                    justifyContent: (open || mobileOpen) ? 'initial' : 'center',
                    px: 2,
                    borderRadius: '12px',
                    backgroundColor: isSelected ? theme.palette.primary.main : 'transparent',
                    color: isSelected ? '#ffffff' : '#64748b',
                    '&:hover': {
                      backgroundColor: isSelected ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.05),
                      color: isSelected ? '#ffffff' : theme.palette.primary.main,
                    },
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: isSelected ? '0 4px 12px rgba(76, 59, 207, 0.2)' : 'none',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: (open || mobileOpen) ? 2 : 'auto',
                      justifyContent: 'center',
                      color: isSelected ? '#ffffff' : 'inherit',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    sx={{
                      opacity: (open || mobileOpen) ? 1 : 0,
                      '& .MuiTypography-root': {
                        fontWeight: isSelected ? 800 : 600,
                        fontSize: '0.9rem',
                      }
                    }}
                  />
                </ListItemButton>
              </Link>
            </ListItem>
          );
        })}
      </List>
    </>
  );

  return (
    <Box sx={{ display: 'flex', backgroundColor: '#f3f4f9', minHeight: '100vh' }}>
      <AppBar position="fixed" open={open} className="no-print" sx={{ width: { sm: `calc(100% - ${open ? drawerWidth : 80}px)` }, ml: { sm: `${open ? drawerWidth : 80}px` } }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', px: { xs: 1, sm: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Tooltip title={open ? "Close Sidebar" : "Open Sidebar"}>
              <IconButton
                color="inherit"
                aria-label="toggle drawer"
                onClick={toggleDrawer}
                edge="start"
                sx={{
                  mr: 2,
                  display: { xs: 'none', sm: 'flex' },
                  color: '#64748b',
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.main,
                    color: '#ffffff',
                  }
                }}
              >
                {open ? <ChevronLeftIcon /> : <MenuIcon />}
              </IconButton>
            </Tooltip>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' }, color: '#64748b' }}
            >
              <MenuIcon />
            </IconButton>

            <Search sx={{ display: { xs: 'none', md: 'block' } }}>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search products, orders..."
                inputProps={{ 'aria-label': 'search' }}
              />
            </Search>

            {/* Section Switcher */}
            {/* <ToggleButtonGroup
              value={section}
              exclusive
              onChange={(_, val) => val && setSection(val)}
              size="small"
              sx={{
                ml: 2,
                backgroundColor: '#ffffff',
                p: 0.5,
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                '& .MuiToggleButton-root': {
                  px: 2,
                  py: 0.5,
                  borderRadius: '8px !important',
                  border: 'none',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  gap: 1,
                  color: '#64748b',
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.main,
                    color: '#ffffff',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    }
                  }
                }
              }}
            >
              <ToggleButton value="retail">
                <ShoppingBagIcon sx={{ fontSize: 18 }} />
                Retail
              </ToggleButton>
              <ToggleButton value="wholesale">
                <BusinessIcon sx={{ fontSize: 18 }} />
                Wholesale
              </ToggleButton>
            </ToggleButtonGroup> */}

            {/* Store Switcher (Superadmin only) */}
            {(hasPermission('manage_stores') || hasPermission('all')) && (
              <>
                <Button
                  onClick={(e) => setStoreAnchorEl(e.currentTarget)}
                  startIcon={<StorefrontIcon />}
                  sx={{
                    ml: 2,
                    backgroundColor: '#ffffff',
                    px: 2,
                    py: 1,
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    color: '#1e293b',
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '0.85rem',
                    border: '1px solid transparent',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      borderColor: alpha(theme.palette.primary.main, 0.2),
                    }
                  }}
                >
                  {currentStore?.name || 'Select Store'}
                  <ExpandMore sx={{ ml: 1, fontSize: 18, opacity: 0.5 }} />
                </Button>
                <Menu
                  anchorEl={storeAnchorEl}
                  open={Boolean(storeAnchorEl)}
                  onClose={() => setStoreAnchorEl(null)}
                  slotProps={{
                    paper: {
                      sx: { borderRadius: '12px', mt: 1, minWidth: 200, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }
                    }
                  }}
                >
                  <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                      Switch Store
                    </Typography>
                  </Box>
                  <Divider />
                  {stores.map((s) => (
                    <MenuItem
                      key={s.id}
                      onClick={() => { switchStore(s.id); setStoreAnchorEl(null); }}
                      selected={currentStore?.id === s.id}
                      sx={{
                        borderRadius: '8px',
                        mx: 1,
                        my: 0.5,
                        fontWeight: 600,
                        '&.Mui-selected': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                          '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.15) }
                        }
                      }}
                    >
                      <ListItemIcon>
                        <StoreIcon fontSize="small" color={currentStore?.id === s.id ? 'primary' : 'inherit'} />
                      </ListItemIcon>
                      <ListItemText primary={s.name} />
                    </MenuItem>
                  ))}
                  <Divider />
                  <Link href="/maintenance/stores" passHref style={{ textDecoration: 'none', color: 'inherit' }}>
                    <MenuItem onClick={() => setStoreAnchorEl(null)} sx={{ mx: 1, my: 0.5, borderRadius: '8px' }}>
                      <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Manage Stores" />
                    </MenuItem>
                  </Link>
                </Menu>
              </>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Notifications">
              <IconButton sx={{ backgroundColor: '#ffffff', borderRadius: '12px', mr: 1, display: { xs: 'none', sm: 'flex' } }}>
                <NotificationsIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
              </IconButton>
            </Tooltip>
            <Box
              onClick={handleProfileMenuOpen}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.2,
                backgroundColor: '#ffffff',
                p: 0.4,
                pr: { xs: 0.4, sm: 1.5 },
                borderRadius: '10px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                cursor: 'pointer',
                '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.02) }
              }}
            >
              <Avatar
                sx={{
                  bgcolor: theme.palette.primary.main,
                  width: { xs: 32, sm: 38 },
                  height: { xs: 32, sm: 38 },
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  boxShadow: '0 4px 10px rgba(76, 59, 207, 0.2)'
                }}
              >
                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>{user?.name}</Typography>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8' }}>{user?.role?.name || 'User'}</Typography>
              </Box>
            </Box>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
              slotProps={{
                paper: {
                  elevation: 0,
                  sx: {
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                    mt: 1.5,
                    borderRadius: '12px',
                    '& .MuiAvatar-root': { width: 32, height: 32, ml: -0.5, mr: 1 },
                    '&:before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: 'background.paper',
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0,
                    },
                  },
                }
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleProfileMenuClose}>
                <Avatar /> Profile
              </MenuItem>
              <MenuItem onClick={handleProfileMenuClose}>
                <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon> My Account
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: theme.palette.error.main }}>
                <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon> Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <MuiDrawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
        className="no-print"
      >
        {drawerContent}
      </MuiDrawer>

      <Drawer variant="permanent" open={open} className="no-print" sx={{ display: { xs: 'none', sm: 'block' } }}>
        {drawerContent}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3 }, mt: 9, width: { sm: `calc(100% - ${open ? drawerWidth : 80}px)` } }}>
        {children}
      </Box>
    </Box>
  );
}
