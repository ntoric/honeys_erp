'use client';

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4c3bcf', // Vibrant Purple
      light: '#7265df',
      dark: '#3529a6',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ffb344', // Orange/Yellow accent
      light: '#ffc571',
      dark: '#e09a2f',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ff6b6b', // Vibrant Red
    },
    success: {
      main: '#48d1cc', // Teal/Cyan
    },
    background: {
      default: '#f3f4f9', // Soft lavender/gray background
      paper: '#ffffff', // White
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#64748b', // Slate gray
    },
    action: {
      selected: '#4c3bcf15', // Light purple for selected items
      hover: '#4c3bcf08',
    },
  },
  typography: {
    fontFamily: 'var(--font-geist-sans), "Inter", "Roboto", sans-serif',
    fontSize: 14,
    h1: { fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2 },
    h2: { fontSize: '2rem', fontWeight: 700, lineHeight: 1.2 },
    h3: { fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.2 },
    h4: { fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.2 },
    h5: { fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.2 },
    h6: { fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.2 },
    subtitle1: { fontSize: '0.875rem', fontWeight: 500 },
    subtitle2: { fontSize: '0.75rem', fontWeight: 500 },
    body1: { fontSize: '0.875rem', lineHeight: 1.5 },
    body2: { fontSize: '0.75rem', lineHeight: 1.5 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(76, 59, 207, 0.2)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06)',
          border: '1px solid rgba(0,0,0,0.05)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06)',
          border: '1px solid rgba(0,0,0,0.05)',
          backgroundColor: '#ffffff',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#1a1a1a',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
          boxShadow: '4px 0 20px 0 rgba(0,0,0,0.02)',
        },
      },
    },
  },
});

export default theme;

