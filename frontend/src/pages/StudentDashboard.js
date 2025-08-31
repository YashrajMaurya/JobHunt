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
  Person as PersonIcon,
  Description as DescriptionIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, applicationsResponse] = await Promise.all([
        axios.get('/api/student/dashboard'),
        axios.get('/api/applications/search?limit=5&page=1')
      ]);

      if (statsResponse.data.success) {
        setStats(statsResponse.data.stats);
      }

      if (applicationsResponse.data.success) {
        setRecentApplications(applicationsResponse.data.applications);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircleIcon color="success" />;
      case 'rejected':
        return <CancelIcon color="error" />;
      case 'pending':
        return <ScheduleIcon color="warning" />;
      default:
        return <DescriptionIcon />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
          Here's what's happening with your job applications
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
                Pending
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
                {stats.acceptedApplications}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Accepted
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
              <TrendingUpIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                {stats.rejectedApplications}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Rejected
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
                <WorkIcon sx={{ fontSize: 30, color: 'primary.main', mr: 1 }} />
                <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                  Browse Jobs
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Discover new opportunities that match your skills and interests
              </Typography>
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate('/jobs')}
                startIcon={<AddIcon />}
              >
                Find Jobs
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
                <PersonIcon sx={{ fontSize: 30, color: 'secondary.main', mr: 1 }} />
                <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                  Update Profile
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Keep your profile and resume up to date for better opportunities
              </Typography>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/student/profile')}
                startIcon={<PersonIcon />}
              >
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Applications */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
              Recent Applications
            </Typography>
            <Button
              variant="text"
              onClick={() => navigate('/student/applications')}
              sx={{ color: 'primary.main' }}
            >
              View All
            </Button>
          </Box>

          {recentApplications.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <DescriptionIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No applications yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Start applying to jobs to see your applications here
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/jobs')}
                startIcon={<WorkIcon />}
              >
                Browse Jobs
              </Button>
            </Box>
          ) : (
            <List>
              {recentApplications.map((application, index) => (
                <React.Fragment key={application._id}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {application.job?.companyName?.charAt(0) || 'C'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {application.job?.title}
                          </Typography>
                          <Chip
                            label={application.status}
                            color={getStatusColor(application.status)}
                            size="small"
                            icon={getStatusIcon(application.status)}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {application.job?.companyName} • {application.job?.field} • {application.job?.location}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Applied on {formatDate(application.appliedAt)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < recentApplications.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Profile Summary */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 3 }}>
            Profile Summary
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {user?.name}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <strong>Field:</strong> {user?.field}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <strong>Graduation Year:</strong> {user?.graduationYear}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Email:</strong> {user?.email}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DescriptionIcon sx={{ mr: 1, color: 'secondary.main' }} />
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  Documents
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <strong>Resume:</strong> {user?.resume?.url ? 'Uploaded' : 'Not uploaded'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <strong>Profile Picture:</strong> {user?.profilePicture?.url ? 'Uploaded' : 'Default'}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/student/profile')}
                sx={{ mt: 1 }}
              >
                Update Documents
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default StudentDashboard;
