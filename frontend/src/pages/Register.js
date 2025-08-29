import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Alert,
  Link,
  Grid,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    phone: '',
    field: '',
    graduationYear: '',
    companyName: '',
    companyDescription: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fields = [
    'Mechanical Engineering',
    'Computer Science',
    'BCA',
    'B.Com',
    'Electrical Engineering',
    'Civil Engineering',
    'Other'
  ];

  const graduationYears = Array.from({ length: 11 }, (_, i) => 2020 + i);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear auth error when user changes role
    if (name === 'role' && error) {
      clearError();
    }
  };

  // no-op: role handled via Select onChange

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.role) {
      newErrors.role = 'Please select your role';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Enter a valid 10-digit number';
    }

    // Role-specific validations
    if (formData.role === 'student') {
      if (!formData.field) {
        newErrors.field = 'Field of study is required';
      }
      if (!formData.graduationYear) {
        newErrors.graduationYear = 'Graduation year is required';
      }
    }

    if (formData.role === 'recruiter') {
      if (!formData.companyName) {
        newErrors.companyName = 'Company name is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone
      };

      // Add role-specific fields
      if (formData.role === 'student') {
        userData.field = formData.field;
        userData.graduationYear = parseInt(formData.graduationYear);
      } else if (formData.role === 'recruiter') {
        userData.companyName = formData.companyName;
        if (formData.companyDescription) {
          userData.companyDescription = formData.companyDescription;
        }
      }

      const result = await register(userData);
      if (result.success) {
        // Redirect based on role
        if (formData.role === 'student') {
          navigate('/student/dashboard');
        } else {
          navigate('/recruiter/dashboard');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          py: 4
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, sm: 4 },
            width: '100%',
            borderRadius: 3
          }}
        >
          <Box textAlign="center" sx={{ mb: 4 }}>
            <Typography
              variant={isMobile ? 'h4' : 'h3'}
              component="h1"
              gutterBottom
              sx={{ fontWeight: 'bold', color: 'primary.main' }}
            >
              Join JobHunt
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create your account and start your career journey
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  autoComplete="name"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  autoComplete="email"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  error={!!errors.phone}
                  helperText={errors.phone}
                  inputProps={{ maxLength: 10, inputMode: 'numeric', pattern: '\\d*' }}
                  autoComplete="tel"
                />
              </Grid>

              {/* Password Fields */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={errors.password}
                  autoComplete="new-password"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  autoComplete="new-password"
                />
              </Grid>

              {/* Role Selection - Dropdown */}
              <Grid item xs={12}>
                <FormControl fullWidth sx={{ minWidth: 200 }}>
                  <InputLabel id="role-label" sx={{ whiteSpace: 'nowrap' }}>Role</InputLabel>
                  <Select
                    labelId="role-label"
                    name="role"
                    value={formData.role}
                    label="Role"
                    onChange={handleChange}
                    error={!!errors.role}
                  >
                    <MenuItem value="student">Student</MenuItem>
                    <MenuItem value="recruiter">Recruiter</MenuItem>
                  </Select>
                  {errors.role && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                      {errors.role}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Student-specific fields */}
              {formData.role === 'student' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id="field-label">Field of Study</InputLabel>
                      <Select
                        labelId="field-label"
                        name="field"
                        value={formData.field}
                        label="Field of Study"
                        onChange={handleChange}
                        error={!!errors.field}
                      >
                        {fields.map((field) => (
                          <MenuItem key={field} value={field}>
                            {field}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.field && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                          {errors.field}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id="graduation-year-label">Graduation Year</InputLabel>
                      <Select
                        labelId="graduation-year-label"
                        name="graduationYear"
                        value={formData.graduationYear}
                        label="Graduation Year"
                        onChange={handleChange}
                        error={!!errors.graduationYear}
                      >
                        {graduationYears.map((year) => (
                          <MenuItem key={year} value={year}>
                            {year}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.graduationYear && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                          {errors.graduationYear}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                </>
              )}

              {/* Recruiter-specific fields */}
              {formData.role === 'recruiter' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Company Name"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      error={!!errors.companyName}
                      helperText={errors.companyName}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Company Description (Optional)"
                      name="companyDescription"
                      value={formData.companyDescription}
                      onChange={handleChange}
                      multiline
                      rows={2}
                    />
                  </Grid>
                </>
              )}
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isSubmitting}
              sx={{
                mt: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                borderRadius: 2
              }}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>

            <Box textAlign="center" sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link
                  component={RouterLink}
                  to="/login"
                  variant="body2"
                  sx={{
                    color: 'primary.main',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Sign in here
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
