import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Typography, TextField, Button, Alert } from '@mui/material';
import { useAdminAuth } from '../../context/AdminAuthContext';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, error } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setLocalError(null);
    const res = await login(email, password);
    setSubmitting(false);
    if (res.success) {
      navigate('/admin/dashboard', { replace: true });
    } else {
      setLocalError(res.message || 'Invalid credentials');
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', p: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>Admin Login</Typography>
          {(localError || error) && <Alert severity="error" sx={{ mb: 2 }}>{localError || error}</Alert>}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2 }} required />
            <TextField fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} sx={{ mb: 2 }} required />
            <Button type="submit" variant="contained" fullWidth disabled={submitting}>{submitting ? 'Signing in...' : 'Sign In'}</Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminLogin;


