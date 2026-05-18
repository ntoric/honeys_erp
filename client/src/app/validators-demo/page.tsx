'use client';

import * as React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Stack,
  InputAdornment,
  Divider,
  Paper,
  Chip,
  IconButton,
} from '@mui/material';
import CheckCircle from '@mui/icons-material/CheckCircle';
import ErrorOutlined from '@mui/icons-material/ErrorOutlined';
import Code from '@mui/icons-material/Code';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import PlayArrow from '@mui/icons-material/PlayArrow';
import Assignment from '@mui/icons-material/Assignment';
import VerifiedUser from '@mui/icons-material/VerifiedUser';
import { toast } from 'sonner';
import { Validators, validateForm } from '@/lib/validators';

export default function ValidatorsDemoPage() {
  // Form input states
  const [formData, setFormData] = React.useState({
    username: '',
    email: '',
    phone: '',
    website: '',
    dob: '',
    age: '',
    customPattern: '',
    password: '',
  });

  // Form error states
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Real-time rules checklist state
  const checklist = React.useMemo(() => {
    return {
      username: {
        required: formData.username.trim() !== '',
        minLength: formData.username.length >= 3,
        alphanumeric: /^[a-zA-Z0-9]+$/.test(formData.username) || formData.username === '',
      },
      email: {
        required: formData.email.trim() !== '',
        validFormat: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(formData.email) || formData.email === '',
      },
      phone: {
        required: formData.phone.trim() !== '',
        validFormat: /^\+?[0-9]{10,15}$/.test(formData.phone) || formData.phone === '',
      },
      website: {
        validFormat: formData.website === '' || /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(formData.website),
      },
      dob: {
        validFormat: formData.dob === '' || (/^\d{4}-\d{2}-\d{2}$/.test(formData.dob) && !isNaN(new Date(formData.dob).getTime())),
      },
      age: {
        range: formData.age === '' || (Number(formData.age) >= 18 && Number(formData.age) <= 100),
      },
      customPattern: {
        pattern: formData.customPattern === '' || /^HEX-[0-9]{4}$/.test(formData.customPattern),
      },
      password: {
        minLen: formData.password.length >= 8,
        upper: /[A-Z]/.test(formData.password),
        lower: /[a-z]/.test(formData.password),
        digit: /[0-9]/.test(formData.password),
        special: /[^A-Za-z0-9]/.test(formData.password),
      },
    };
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field-level error immediately when typing
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleTestSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Set up validation schema
    const rules = {
      username: [
        Validators.required('Username is required'),
        Validators.minLength(3, 'Username must be at least 3 characters'),
        Validators.alphanumeric('Username must contain only letters and digits'),
      ],
      email: [
        Validators.required('Email address is required'),
        Validators.email('Please specify a valid email address'),
      ],
      phone: [
        Validators.required('Phone number is required'),
        Validators.phone('Invalid phone number format (must be 10-15 digits)'),
      ],
      website: [
        Validators.url('Invalid URL format (include scheme, e.g. https://)'),
      ],
      dob: [
        Validators.date('Invalid date format (must be YYYY-MM-DD)'),
      ],
      age: [
        Validators.min(18, 'You must be at least 18 years old'),
        Validators.max(100, 'Age must be 100 or younger'),
      ],
      customPattern: [
        Validators.pattern(/^HEX-[0-9]{4}$/, 'Format must match pattern: HEX-1234'),
      ],
      password: [
        Validators.password('Password does not satisfy complexity requirements'),
      ],
    };

    const formErrors = validateForm(formData, rules);

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      toast.error('Validation failed! Please review the errors in the form.');
    } else {
      setErrors({});
      toast.success('Form successfully validated! All parameters comply with security and formatting standards.');
    }
  };

  const handleAutofillValid = () => {
    setFormData({
      username: 'Alice2026',
      email: 'alice.retailer@honeyspos.com',
      phone: '+919876543210',
      website: 'https://honeyspos.com',
      dob: '1998-05-17',
      age: '28',
      customPattern: 'HEX-4040',
      password: 'SecurePassword123!',
    });
    setErrors({});
    toast.info('Form autofilled with valid, standard data values');
  };

  const handleReset = () => {
    setFormData({
      username: '',
      email: '',
      phone: '',
      website: '',
      dob: '',
      age: '',
      customPattern: '',
      password: '',
    });
    setErrors({});
    toast.success('All playground inputs and errors have been reset');
  };

  return (
    <Box sx={{ py: 6, px: 2, background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        {/* Page Header */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Chip 
            icon={<VerifiedUser sx={{ color: '#4c3bcf !important' }} />}
            label="Unified Validation Framework" 
            sx={{ 
              fontWeight: 700, 
              backgroundColor: 'rgba(76, 59, 207, 0.08)', 
              color: '#4c3bcf',
              mb: 2,
              px: 1,
              py: 2.2,
              fontSize: '0.85rem',
              borderRadius: '20px',
              border: '1px solid rgba(76, 59, 207, 0.15)'
            }}
          />
          <Typography 
            variant="h2" 
            sx={{ 
              fontWeight: 900, 
              color: '#0f172a',
              letterSpacing: '-1.5px',
              mb: 1.5,
              fontSize: { xs: '2.2rem', md: '3rem' }
            }}
          >
            Form Field Validators Playground
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b', maxWidth: '700px', mx: 'auto', fontWeight: 500, fontSize: '1rem' }}>
            Interactive validation inspector. Test common rules implemented identically in both the Go server backend and the React TypeScript frontend.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Left Column - Interactive Form */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Card sx={{ 
              borderRadius: '24px', 
              boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.07)', 
              border: '1px solid rgba(255, 255, 255, 0.7)',
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(20px)',
              overflow: 'hidden'
            }}>
              <Box sx={{ p: 4, background: 'linear-gradient(135deg, #4c3bcf 0%, #3529a6 100%)', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>Playground Interface</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.85, fontWeight: 500 }}>Enter data below to test client/server-side validation</Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    onClick={handleAutofillValid}
                    sx={{ 
                      borderColor: 'rgba(255,255,255,0.4)', 
                      color: '#ffffff',
                      borderRadius: '8px',
                      '&:hover': { borderColor: '#ffffff', background: 'rgba(255,255,255,0.1)' }
                    }}
                  >
                    Autofill Valid
                  </Button>
                  <Button 
                    size="small" 
                    variant="text" 
                    onClick={handleReset}
                    sx={{ 
                      color: 'rgba(255,255,255,0.8)',
                      borderRadius: '8px',
                      '&:hover': { color: '#ffffff', background: 'rgba(255,255,255,0.08)' }
                    }}
                  >
                    Reset
                  </Button>
                </Stack>
              </Box>

              <CardContent sx={{ p: 4 }}>
                <form onSubmit={handleTestSubmit}>
                  <Stack spacing={3.5}>
                    {/* Basic Grid */}
                    <Grid container spacing={3.5}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          name="username"
                          label="Username"
                          fullWidth
                          value={formData.username}
                          onChange={handleChange}
                          error={!!errors.username}
                          helperText={errors.username}
                          placeholder="e.g. user123"
                          slotProps={{
                            input: {
                              startAdornment: <InputAdornment position="start"><Code sx={{ fontSize: '1.2rem', color: '#64748b' }} /></InputAdornment>,
                            }
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          name="email"
                          label="Email Address"
                          fullWidth
                          value={formData.email}
                          onChange={handleChange}
                          error={!!errors.email}
                          helperText={errors.email}
                          placeholder="e.g. you@example.com"
                        />
                      </Grid>
                    </Grid>

                    <Grid container spacing={3.5}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          name="phone"
                          label="Phone Number"
                          fullWidth
                          value={formData.phone}
                          onChange={handleChange}
                          error={!!errors.phone}
                          helperText={errors.phone}
                          placeholder="e.g. +919876543210"
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          name="website"
                          label="Website URL"
                          fullWidth
                          value={formData.website}
                          onChange={handleChange}
                          error={!!errors.website}
                          helperText={errors.website || 'Optional. Must start with http:// or https://'}
                          placeholder="e.g. https://example.com"
                        />
                      </Grid>
                    </Grid>

                    <Grid container spacing={3.5}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          name="dob"
                          label="Date of Birth"
                          fullWidth
                          value={formData.dob}
                          onChange={handleChange}
                          error={!!errors.dob}
                          helperText={errors.dob || 'Optional. Required layout: YYYY-MM-DD'}
                          placeholder="YYYY-MM-DD"
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          name="age"
                          label="Age"
                          fullWidth
                          type="number"
                          value={formData.age}
                          onChange={handleChange}
                          error={!!errors.age}
                          helperText={errors.age || 'Optional. Allowed range: 18 - 100'}
                          placeholder="18+"
                        />
                      </Grid>
                    </Grid>

                    <TextField
                      name="customPattern"
                      label="Custom Regex String"
                      fullWidth
                      value={formData.customPattern}
                      onChange={handleChange}
                      error={!!errors.customPattern}
                      helperText={errors.customPattern || 'Optional. Pattern must match format: HEX-DDDD (e.g. HEX-4235)'}
                      placeholder="HEX-0000"
                    />

                    <TextField
                      name="password"
                      label="Complex Security Password"
                      fullWidth
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      error={!!errors.password}
                      helperText={errors.password || 'Requires min 8 chars, 1 uppercase, 1 lowercase, 1 number, and 1 special symbol'}
                      placeholder="••••••••"
                    />

                    <Divider sx={{ my: 1 }} />

                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      size="large"
                      startIcon={<PlayArrow />}
                      sx={{ 
                        borderRadius: '12px', 
                        py: 1.8, 
                        fontWeight: 800, 
                        fontSize: '1rem',
                        backgroundColor: '#4c3bcf',
                        '&:hover': {
                          backgroundColor: '#3529a6',
                        }
                      }}
                    >
                      Run Validators Form
                    </Button>
                  </Stack>
                </form>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column - Rules checklist & console */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={4}>
              {/* Validation Monitor */}
              <Card sx={{ 
                borderRadius: '24px', 
                boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.07)', 
                border: '1px solid rgba(255, 255, 255, 0.7)',
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(20px)',
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Assignment sx={{ color: '#4c3bcf' }} /> Validation Monitor
                  </Typography>

                  <Stack spacing={3}>
                    {/* Username checklist */}
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#475569', mb: 1 }}>Username Rules</Typography>
                      <Stack spacing={0.8} sx={{ pl: 1 }}>
                        <RuleItem label="Not Empty" passed={checklist.username.required} />
                        <RuleItem label="At least 3 characters" passed={checklist.username.minLength} />
                        <RuleItem label="Alphanumeric charset" passed={checklist.username.alphanumeric} />
                      </Stack>
                    </Box>

                    <Divider />

                    {/* Email & Phone */}
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#475569', mb: 1 }}>Email & Phone</Typography>
                      <Stack spacing={0.8} sx={{ pl: 1 }}>
                        <RuleItem label="Valid Email structure" passed={checklist.email.validFormat} />
                        <RuleItem label="Phone standard (10-15 digits)" passed={checklist.phone.validFormat} />
                      </Stack>
                    </Box>

                    <Divider />

                    {/* Format Boundaries */}
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#475569', mb: 1 }}>Formats & Bounds</Typography>
                      <Stack spacing={0.8} sx={{ pl: 1 }}>
                        <RuleItem label="Website absolute URL (Optional)" passed={checklist.website.validFormat} />
                        <RuleItem label="Date format (YYYY-MM-DD) (Optional)" passed={checklist.dob.validFormat} />
                        <RuleItem label="Age limit (18 - 100) (Optional)" passed={checklist.age.range} />
                        <RuleItem label="Regex pattern (HEX-DDDD) (Optional)" passed={checklist.customPattern.pattern} />
                      </Stack>
                    </Box>

                    <Divider />

                    {/* Password Strength */}
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#475569', mb: 1 }}>Password Strength Rules</Typography>
                      <Stack spacing={0.8} sx={{ pl: 1 }}>
                        <RuleItem label="Min length of 8 characters" passed={checklist.password.minLen} />
                        <RuleItem label="At least one uppercase letter (A-Z)" passed={checklist.password.upper} />
                        <RuleItem label="At least one lowercase letter (a-z)" passed={checklist.password.lower} />
                        <RuleItem label="At least one numeric digit (0-9)" passed={checklist.password.digit} />
                        <RuleItem label="At least one special character" passed={checklist.password.special} />
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* Architectural Info Card */}
              <Paper sx={{ 
                borderRadius: '20px', 
                p: 3.5, 
                backgroundColor: 'rgba(255, 179, 68, 0.08)',
                border: '1px solid rgba(255, 179, 68, 0.25)',
                color: '#7c2d12'
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InfoOutlined sx={{ color: '#ffb344' }} /> Multi-Store Security Note
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, lineHeight: 1.6, fontWeight: 500 }}>
                  This validation framework guarantees strict type matching, sanitizes user inputs at both frontend and backend boundaries, and is completely multi-store compatible. Custom error patterns map directly to individual system field paths.
                </Typography>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

interface RuleItemProps {
  label: string;
  passed: boolean;
}

function RuleItem({ label, passed }: RuleItemProps) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      {passed ? (
        <CheckCircle sx={{ color: '#48d1cc', fontSize: '1rem' }} />
      ) : (
        <ErrorOutlined sx={{ color: '#ff6b6b', fontSize: '1rem' }} />
      )}
      <Typography 
        variant="body2" 
        sx={{ 
          color: passed ? '#334155' : '#64748b', 
          fontWeight: passed ? 600 : 500,
          fontSize: '0.8rem',
          transition: 'all 0.2s ease'
        }}
      >
        {label}
      </Typography>
    </Stack>
  );
}
