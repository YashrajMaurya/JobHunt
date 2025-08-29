import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  useTheme
} from '@mui/material';
import {
  Work as WorkIcon,
  Search as SearchIcon,
  Send as ApplyIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const features = [
    {
      icon: <SearchIcon sx={{ fontSize: 40 }} />,
      title: 'Find Your Dream Job',
      description: 'Browse through thousands of job opportunities across various fields and locations.'
    },
    {
      icon: <ApplyIcon sx={{ fontSize: 40 }} />,
      title: 'Easy Application Process',
      description: 'Apply to multiple jobs with just a few clicks using your uploaded resume.'
    },
    {
      icon: <NotificationsIcon sx={{ fontSize: 40 }} />,
      title: 'Real-time Updates',
      description: 'Get instant notifications about your application status and new opportunities.'
    }
  ];

  const stats = [
    { label: 'Active Jobs', value: '500+', color: 'primary.main' },
    { label: 'Companies', value: '100+', color: 'secondary.main' },
    { label: 'Students Placed', value: '1000+', color: 'success.main' },
    { label: 'Success Rate', value: '95%', color: 'warning.main' }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
                             <Typography
                 variant="h2"
                 component="h1"
                 gutterBottom
                 sx={{ fontWeight: 'bold' }}
               >
                Find Your Perfect
                <br />
                <Box component="span" sx={{ color: '#ffd700' }}>
                  Career Path with Indus University
                </Box>
              </Typography>
              <Typography
                variant="h6"
                sx={{ mb: 4, opacity: 0.9, lineHeight: 1.6 }}
              >
                At Indus University, where Practice Meets Theory, our JobHunt bridges your skills with real opportunities. Whether you're a student stepping into the world of internships or a graduate ready to embrace new professional challenges, discover paths that match your aspirations and unlock your potential.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/jobs')}
                  sx={{
                    backgroundColor: '#ffd700',
                    color: '#333',
                    '&:hover': {
                      backgroundColor: '#ffed4e',
                    },
                    px: 4,
                    py: 1.5
                  }}
                >
                  Browse Jobs
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    px: 4,
                    py: 1.5
                  }}
                >
                  Get Started
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 400
                }}
              >
                <Box
                  sx={{
                    width: 300,
                    height: 300,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <WorkIcon sx={{ fontSize: 120, opacity: 0.8 }} />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Card
                sx={{
                  textAlign: 'center',
                  py: 3,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    transition: 'transform 0.3s ease-in-out',
                    boxShadow: theme.shadows[8]
                  }
                }}
              >
                <CardContent>
                  <Typography
                    variant="h3"
                    component="div"
                    sx={{ color: stat.color, fontWeight: 'bold', mb: 1 }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Section */}
      <Box sx={{ py: 8, backgroundColor: 'background.default' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            textAlign="center"
            gutterBottom
            sx={{ mb: 6, fontWeight: 'bold' }}
          >
            Why Choose JobHunt?
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    p: 3,
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      transition: 'transform 0.3s ease-in-out',
                      boxShadow: theme.shadows[12]
                    }
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      mb: 2,
                      color: 'primary.main'
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h5"
                    component="h3"
                    gutterBottom
                    sx={{ fontWeight: 'bold' }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          py: 8
        }}
      >
        <Container maxWidth="md">
          <Box textAlign="center">
            <Typography
              variant="h3"
              component="h2"
              gutterBottom
              sx={{ fontWeight: 'bold', mb: 3 }}
            >
              Ready to Start Your Journey?
            </Typography>
            <Typography
              variant="h6"
              sx={{ mb: 4, opacity: 0.9 }}
            >
              Join thousands of students and professionals who have found their dream jobs through JobHunt
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                sx={{
                  backgroundColor: 'white',
                  color: '#f5576c',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                  px: 4,
                  py: 1.5
                }}
              >
                Sign Up Now
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/jobs')}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  px: 4,
                  py: 1.5
                }}
              >
                Explore Jobs
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
