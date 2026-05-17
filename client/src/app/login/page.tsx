'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  alpha,
  useTheme,
  CircularProgress,
  Paper,
  Fade,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  LockOutlined,
  EmailOutlined,
  ReceiptOutlined,
  ArrowForward,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AuthService } from '@/api/services/AuthService';

export default function LoginPage() {
  const theme = useTheme();
  const { login, refreshUser } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isChangePassword = searchParams.get('changePassword') === 'true';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string; newPassword?: string; confirmPassword?: string }>({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await login(username.trim(), password);
    } catch (error: any) {
      if (error.message === 'Invalid credentials') {
        setErrors({ username: 'Invalid username or password', password: ' ' });
      } else {
        toast.error(error.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await AuthService.postAuthChangePassword({
        old_password: password,
        new_password: newPassword
      });
      toast.success('Password changed successfully');
      await refreshUser();
      router.push('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        overflow: 'auto',
      }}
    >
      {/* Background Orbs */}
      <Box sx={{ position: 'absolute', top: '10%', left: '10%', width: 300, height: 300, borderRadius: '50%', background: alpha('#fff', 0.1), filter: 'blur(80px)', pointerEvents: 'none' }} />
      <Box sx={{ position: 'absolute', bottom: '10%', right: '10%', width: 400, height: 400, borderRadius: '50%', background: alpha(theme.palette.secondary.main, 0.2), filter: 'blur(100px)', pointerEvents: 'none' }} />

      <Container maxWidth="sm">
        <Fade in timeout={800}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: '24px',
              overflow: 'hidden',
              background: alpha('#ffffff', 0.9),
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
            }}
          >
            <Box sx={{ p: { xs: 4, md: 6 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 4 }}>
                <Box
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: '16px',
                    p: 1,
                    display: 'flex',
                    boxShadow: '0 8px 20px rgba(76, 59, 207, 0.3)',
                  }}
                >
                  <ReceiptOutlined sx={{ color: '#ffffff', fontSize: 32 }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 900, color: theme.palette.primary.main, letterSpacing: '-1px' }}>
                  Hexonics
                </Typography>
              </Box>

              <Typography variant="h5" align="center" sx={{ fontWeight: 800, color: '#1e293b', mb: 1 }}>
                {isChangePassword ? 'Set New Password' : 'Welcome Back!'}
              </Typography>
              <Typography variant="body1" align="center" sx={{ color: '#64748b', mb: 4, fontWeight: 500 }}>
                {isChangePassword 
                  ? 'Your temporary password is valid for 24 hours. Please set a permanent password.' 
                  : 'Please enter your credentials to access your account.'}
              </Typography>

              <form onSubmit={isChangePassword ? handleChangePassword : handleLogin}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  {!isChangePassword && (
                    <TextField
                      fullWidth
                      label="Username"
                      placeholder="ntoric"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      error={!!errors.username}
                      helperText={errors.username}
                      required
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon sx={{ color: '#94a3b8' }} />
                            </InputAdornment>
                          ),
                          sx: { borderRadius: '12px', height: 56 }
                        }
                      }}
                    />
                  )}

                  <TextField
                    fullWidth
                    label={isChangePassword ? "Temporary Password" : "Password"}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={!!errors.password}
                    helperText={errors.password}
                    required
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlined sx={{ color: '#94a3b8' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                        sx: { borderRadius: '12px', height: 56 }
                      }
                    }}
                  />

                  {isChangePassword && (
                    <>
                      <TextField
                        fullWidth
                        label="New Password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        error={!!errors.newPassword}
                        helperText={errors.newPassword}
                        required
                        slotProps={{ input: { sx: { borderRadius: '12px', height: 56 } } }}
                      />
                      <TextField
                        fullWidth
                        label="Confirm New Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword}
                        required
                        slotProps={{ input: { sx: { borderRadius: '12px', height: 56 } } }}
                      />
                    </>
                  )}

                  {!isChangePassword && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Typography variant="body2" sx={{ color: theme.palette.primary.main, fontWeight: 700, cursor: 'pointer' }}>
                        Forgot Password?
                      </Typography>
                    </Box>
                  )}

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={loading}
                    sx={{
                      height: 56,
                      borderRadius: '12px',
                      fontSize: '1rem',
                      fontWeight: 800,
                      boxShadow: '0 12px 24px rgba(76, 59, 207, 0.3)',
                      mt: 1,
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : (
                      <>
                        {isChangePassword ? 'Change Password' : 'Sign In'}
                        <ArrowForward sx={{ ml: 1 }} />
                      </>
                    )}
                  </Button>
                </Box>
              </form>
            </Box>
            <Box sx={{ p: 3, textAlign: 'center', backgroundColor: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
              <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                Powered by Hexonics Cloud POS
              </Typography>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
}
