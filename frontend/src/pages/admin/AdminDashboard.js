import React, { useEffect, useState, useMemo } from 'react';
import { Box, Grid, Card, CardContent, Typography, Button, Chip, Stack, TextField, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import api from '../../config/api';
import { useAdminAuth } from '../../context/AdminAuthContext';

const StatCard = ({ label, value }) => (
  <Card>
    <CardContent>
      <Typography variant="overline" color="text.secondary">{label}</Typography>
      <Typography variant="h5">{value}</Typography>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const { logout } = useAdminAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [userQuery, setUserQuery] = useState('');
  const [jobQuery, setJobQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [s, u, j, a] = await Promise.all([
        api.get('/api/admin/stats'),
        api.get('/api/admin/users?limit=10'),
        api.get('/api/admin/jobs?limit=10'),
        api.get('/api/admin/applications?limit=10'),
      ]);
      setStats(s.data);
      setUsers(u.data.items);
      setJobs(j.data.items);
      setApplications(a.data.items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const filteredUsers = useMemo(() => {
    if (!userQuery) return users;
    const q = userQuery.toLowerCase();
    return users.filter(u => (u.name||'').toLowerCase().includes(q) || (u.email||'').toLowerCase().includes(q) || (u.phone||'').includes(q));
  }, [users, userQuery]);

  const filteredJobs = useMemo(() => {
    if (!jobQuery) return jobs;
    const q = jobQuery.toLowerCase();
    return jobs.filter(j => (j.title||'').toLowerCase().includes(q) || (j.companyName||'').toLowerCase().includes(q));
  }, [jobs, jobQuery]);

  const toggleUser = async (id) => {
    setConfirm({ type: 'user', id });
  };

  const toggleJob = async (id) => {
    setConfirm({ type: 'job', id });
  };

  const confirmAction = async () => {
    if (!confirm) return;
    try {
      if (confirm.type === 'user') {
        const res = await api.patch(`/api/admin/users/${confirm.id}/toggle`);
        setUsers(prev => prev.map(u => u._id === res.data.user._id ? res.data.user : u));
      } else if (confirm.type === 'job') {
        const res = await api.patch(`/api/admin/jobs/${confirm.id}/toggle`);
        setJobs(prev => prev.map(j => j._id === res.data.job._id ? res.data.job : j));
      }
    } finally {
      setConfirm(null);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Admin Dashboard</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={logout}>Logout</Button>
          <IconButton onClick={loadAll} disabled={loading} aria-label="refresh"><RefreshIcon /></IconButton>
        </Stack>
      </Box>

      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2}><StatCard label="Users" value={stats.totals.totalUsers} /></Grid>
          <Grid item xs={12} sm={6} md={2}><StatCard label="Students" value={stats.totals.totalStudents} /></Grid>
          <Grid item xs={12} sm={6} md={2}><StatCard label="Recruiters" value={stats.totals.totalRecruiters} /></Grid>
          <Grid item xs={12} sm={6} md={2}><StatCard label="Jobs" value={stats.totals.totalJobs} /></Grid>
          <Grid item xs={12} sm={6} md={2}><StatCard label="Active Jobs" value={stats.totals.activeJobs} /></Grid>
          <Grid item xs={12} sm={6} md={2}><StatCard label="Applications" value={stats.totals.totalApplications} /></Grid>
        </Grid>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6">Recent Users</Typography>
                <TextField size="small" placeholder="Search users" value={userQuery} onChange={(e) => setUserQuery(e.target.value)} />
              </Box>
              {filteredUsers.map(u => (
                <Box key={u._id} sx={{ py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #eee' }}>
                  <Box>
                    <Typography>{u.name} <Chip size="small" label={u.role} sx={{ ml: 1 }} /></Typography>
                    <Typography variant="body2" color="text.secondary">{u.email} • {u.phone}</Typography>
                  </Box>
                  <Button size="small" variant={u.isActive ? 'outlined' : 'contained'} color={u.isActive ? 'warning' : 'success'} onClick={() => toggleUser(u._id)}>
                    {u.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6">Recent Jobs</Typography>
                <TextField size="small" placeholder="Search jobs" value={jobQuery} onChange={(e) => setJobQuery(e.target.value)} />
              </Box>
              {filteredJobs.map(j => (
                <Box key={j._id} sx={{ py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #eee' }}>
                  <Box>
                    <Typography>{j.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{j.companyName} • {j.field} • {j.location}</Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                      {j.isActive ? <Chip size="small" color="success" label="Active"/> : <Chip size="small" color="default" label="Inactive"/>}
                      <Chip size="small" label={`Apps: ${j.totalApplications||0}`} />
                    </Stack>
                  </Box>
                  <Button size="small" variant={j.isActive ? 'outlined' : 'contained'} color={j.isActive ? 'warning' : 'success'} onClick={() => toggleJob(j._id)}>
                    {j.isActive ? 'Disable' : 'Enable'}
                  </Button>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6">Recent Applications</Typography>
          </Box>
          {applications.map(a => (
            <Box key={a._id} sx={{ py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #eee' }}>
              <Box>
                <Typography>{a.student?.name} → {a.job?.title} @ {a.job?.companyName}</Typography>
                <Typography variant="body2" color="text.secondary">Status: {a.status} • {new Date(a.createdAt).toLocaleString()}</Typography>
              </Box>
              <Chip size="small" label={a.status} />
            </Box>
          ))}
        </CardContent>
      </Card>

      <Dialog open={!!confirm} onClose={() => setConfirm(null)}>
        <DialogTitle>Confirm action</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to proceed?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm(null)}>Cancel</Button>
          <Button variant="contained" onClick={confirmAction}>Confirm</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;


