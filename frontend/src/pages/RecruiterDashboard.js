import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Work as WorkIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Business as BusinessIcon,
  Description as DescriptionIcon,
  Add as AddIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, jobsResponse] = await Promise.all([
        axios.get('/api/recruiter/dashboard'),
        axios.get('/api/recruiter/jobs?limit=5')
      ]);

      if (statsResponse.data.success) {
        setStats(statsResponse.data.stats);
      }

      if (jobsResponse.data.success) {
        setRecentJobs(jobsResponse.data.jobs);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatSalary = (min, max) => {
    return `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Typography>Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant={isMobile ? 'h4' : 'h3'}
          component="h1"
          gutterBottom
          sx={{ fontWeight: 'bold', color: 'primary.main' }}
        >
          Welcome back, {user?.name}! 👋
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Here's an overview of your job postings and applications
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={3}>
          <Card
            sx={{
              textAlign: 'center',
              py: 2,
              '&:hover': {
                transform: 'translateY(-4px)',
                transition: 'transform 0.3s ease-in-out',
                boxShadow: theme.shadows[8]
              }
            }}
          >
            <CardContent>
              <WorkIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {stats.totalJobs}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Jobs
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card
            sx={{
              textAlign: 'center',
              py: 2,
              '&:hover': {
                transform: 'translateY(-4px)',
                transition: 'transform 0.3s ease-in-out',
                boxShadow: theme.shadows[8]
              }
            }}
          >
            <CardContent>
              <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                {stats.activeJobs}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Jobs
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card
            sx={{
              textAlign: 'center',
              py: 2,
              '&:hover': {
                transform: 'translateY(-4px)',
                transition: 'transform 0.3s ease-in-out',
                boxShadow: theme.shadows[8]
              }
            }}
          >
            <CardContent>
              <PeopleIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                {stats.totalApplications}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Applications
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card
            sx={{
              textAlign: 'center',
              py: 2,
              '&:hover': {
                transform: 'translateY(-4px)',
                transition: 'transform 0.3s ease-in-out',
                boxShadow: theme.shadows[8]
              }
            }}
          >
            <CardContent>
              <ScheduleIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                {stats.pendingApplications}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Review
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              height: '100%',
              '&:hover': {
                transform: 'translateY(-4px)',
                transition: 'transform 0.3s ease-in-out',
                boxShadow: theme.shadows[8]
              }
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AddIcon sx={{ fontSize: 30, color: 'primary.main', mr: 1 }} />
                <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                  Post New Job
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Create a new job posting to attract talented candidates
              </Typography>
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate('/recruiter/create-job')}
                startIcon={<AddIcon />}
              >
                Create Job
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card
            sx={{
              height: '100%',
              '&:hover': {
                transform: 'translateY(-4px)',
                transition: 'transform 0.3s ease-in-out',
                boxShadow: theme.shadows[8]
              }
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DescriptionIcon sx={{ fontSize: 30, color: 'secondary.main', mr: 1 }} />
                <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                  Review Applications
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Review and manage applications from interested candidates
              </Typography>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/recruiter/applications')}
                startIcon={<DescriptionIcon />}
              >
                View Applications
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Jobs */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
              Recent Job Postings
            </Typography>
            <Button
              variant="text"
              onClick={() => navigate('/recruiter/jobs')}
              sx={{ color: 'primary.main' }}
            >
              View All
            </Button>
          </Box>

          {recentJobs.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <WorkIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No jobs posted yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Start posting jobs to attract talented candidates
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/recruiter/create-job')}
                startIcon={<AddIcon />}
              >
                Post Your First Job
              </Button>
            </Box>
          ) : (
            <List>
              {recentJobs.map((job, index) => (
                <React.Fragment key={job._id}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {job.companyName?.charAt(0) || 'C'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {job.title}
                          </Typography>
                          <Chip
                            label={job.isActive ? 'Active' : 'Inactive'}
                            color={getStatusColor(job.isActive ? 'active' : 'inactive')}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {job.field} • {job.location} • {job.type}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Salary: {formatSalary(job.salary.min, job.salary.max)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Posted on {formatDate(job.createdAt)} • {job.totalApplications} applications
                          </Typography>
                        </Box>
                      }
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => navigate(`/recruiter/jobs/${job._id}/applications`)}
                    >
                      View Applications
                    </Button>
                  </ListItem>
                  {index < recentJobs.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Company Profile Summary */}
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 3 }}>
            Company Profile
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {user?.companyName}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <strong>Company:</strong> {user?.companyName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <strong>Contact:</strong> {user?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Email:</strong> {user?.email}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DescriptionIcon sx={{ mr: 1, color: 'secondary.main' }} />
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  Company Details
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <strong>Description:</strong> {user?.companyDescription || 'No description provided'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <strong>Logo:</strong> {user?.companyLogo?.url ? 'Uploaded' : 'Default'}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/recruiter/profile')}
                sx={{ mt: 1 }}
              >
                Update Profile
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default RecruiterDashboard;
