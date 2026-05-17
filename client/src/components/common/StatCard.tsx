'use client';

import * as React from 'react';
import { Box, Paper, Typography, alpha, useTheme, Chip } from '@mui/material';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  trend?: string;
}

const StatCard = ({ title, value, icon, color, subtitle, trend }: StatCardProps) => {
  const theme = useTheme();
  
  return (
    <Paper sx={{ 
      p: 2, 
      borderRadius: '12px', 
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)', 
      border: '1px solid #f1f5f9',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        transform: 'translateY(-2px)'
      }
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
        <Box sx={{ 
          p: 1.2, 
          borderRadius: '10px', 
          backgroundColor: alpha(color, 0.1), 
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          {React.cloneElement(icon as React.ReactElement<any>, { sx: { fontSize: '1.25rem' } })}
        </Box>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.2 }}>
            <Typography sx={{ 
              color: '#64748b', 
              fontSize: '0.7rem', 
              fontWeight: 700, 
              textTransform: 'uppercase', 
              letterSpacing: '0.5px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {title}
            </Typography>
            {trend && (
              <Chip 
                label={trend} 
                size="small" 
                sx={{ 
                  height: 18, 
                  fontSize: '0.6rem', 
                  fontWeight: 800, 
                  backgroundColor: trend.startsWith('+') ? '#f0fdf4' : '#fef2f2',
                  color: trend.startsWith('+') ? '#16a34a' : '#ef4444',
                  ml: 1
                }} 
              />
            )}
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography sx={{ 
              color: '#94a3b8', 
              fontSize: '0.65rem', 
              fontWeight: 500,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default StatCard;
