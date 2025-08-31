import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Pagination,
  useTheme,
  useMediaQuery,
  InputAdornment,
  Skeleton,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Work as WorkIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const JobList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    field: 'all',
    type: 'all',
    experience: 'all',
    location: 'all'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });

  const fields = [
    'Mechanical Engineering',
    'Computer Science',
    'BCA',
    'B.Com',
    'Electrical Engineering',
    'Civil Engineering',
    'Other'
  ];

  const jobTypes = ['Full-time', 'Part-time', 'Internship', 'Contract'];
  const experienceLevels = ['Fresher', '1-2 years'];

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pagination.currentPage]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: 10,
        ...filters
      });

      // Remove 'all' values from params
      Object.keys(params).forEach(key => {
        if (params.get(key) === 'all') {
          params.delete(key);
        }
      });

      const response = await axios.get(`/api/jobs?${params}`);
      
      if (response.data.success) {
        setJobs(response.data.jobs);
        setPagination(prev => ({
          ...prev,
          totalPages: response.data.totalPages,
          total: response.data.total
        }));
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to fetch jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      field: 'all',
      type: 'all',
      experience: 'all',
      location: 'all'
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const formatSalary = (min, max) => {
    return `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilDeadline = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isDeadlinePassed = (deadline) => {
    return getDaysUntilDeadline(deadline) <= 0;
  };

  const getDeadlineText = (deadline) => {
    const daysLeft = getDaysUntilDeadline(deadline);
    if (daysLeft <= 0) {
      return 'Application Closed';
    } else if (daysLeft === 1) {
      return '1 day left';
    } else {
      return `${daysLeft} days left`;
    }
  };

  const renderJobCard = (job) => (
    <Grid item xs={12} md={6} lg={4} key={job._id}>
      <Card
        sx={{
          height: '100%',
          cursor: isDeadlinePassed(job.applicationDeadline) ? 'not-allowed' : 'pointer',
          opacity: isDeadlinePassed(job.applicationDeadline) ? 0.7 : 1,
          '&:hover': {
            transform: isDeadlinePassed(job.applicationDeadline) ? 'none' : 'translateY(-4px)',
            transition: 'transform 0.3s ease-in-out',
            boxShadow: isDeadlinePassed(job.applicationDeadline) ? theme.shadows[1] : theme.shadows[8]
          }
        }}
        onClick={() => !isDeadlinePassed(job.applicationDeadline) && navigate(`/jobs/${job._id}`)}
      >
        <CardContent>
          {isDeadlinePassed(job.applicationDeadline) && (
            <Box sx={{ mb: 2 }}>
              <Chip
                label="Application Closed"
                color="error"
                size="small"
                variant="filled"
                sx={{ fontWeight: 'bold' }}
              />
            </Box>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
              {job.title}
            </Typography>
            <Chip
              label={job.type}
              color="primary"
              size="small"
              variant="outlined"
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <BusinessIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {job.companyName}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocationIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {job.location}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <WorkIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {job.field}
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {job.description.length > 100 
              ? `${job.description.substring(0, 100)}...` 
              : job.description
            }
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              {formatSalary(job.salary.min, job.salary.max)}
            </Typography>
            <Chip
              label={job.experience}
              size="small"
              variant="outlined"
              color="secondary"
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Posted {formatDate(job.createdAt)}
            </Typography>
            <Chip
              label={getDeadlineText(job.applicationDeadline)}
              size="small"
              color={isDeadlinePassed(job.applicationDeadline) ? 'error' : (getDaysUntilDeadline(job.applicationDeadline) <= 7 ? 'warning' : 'default')}
              variant={isDeadlinePassed(job.applicationDeadline) ? 'filled' : 'outlined'}
            />
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant={isMobile ? 'h4' : 'h3'}
          component="h1"
          gutterBottom
          sx={{ fontWeight: 'bold', color: 'primary.main' }}
        >
          Find Your Dream Job
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Discover opportunities that match your skills and aspirations
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box component="form" onSubmit={handleSearch}>
            <Grid container spacing={2} alignItems="center">
              {/* Search Bar */}
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search jobs, companies, or skills..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Field Filter */}
              <Grid item xs={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel shrink sx={{ whiteSpace: 'nowrap' }}>Field</InputLabel>
                  <Select
                    value={filters.field}
                    label="Field"
                    onChange={(e) => handleFilterChange('field', e.target.value)}
                  >
                    <MenuItem value="all">All Fields</MenuItem>
                    {fields.map((field) => (
                      <MenuItem key={field} value={field}>
                        {field}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Job Type Filter */}
              <Grid item xs={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel shrink sx={{ whiteSpace: 'nowrap' }}>Type</InputLabel>
                  <Select
                    value={filters.type}
                    label="Type"
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    {jobTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Experience Filter */}
              <Grid item xs={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel shrink sx={{ whiteSpace: 'nowrap' }}>Experience</InputLabel>
                  <Select
                    value={filters.experience}
                    label="Experience"
                    onChange={(e) => handleFilterChange('experience', e.target.value)}
                  >
                    <MenuItem value="all">All Levels</MenuItem>
                    {experienceLevels.map((level) => (
                      <MenuItem key={level} value={level}>
                        {level}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={6} md={2}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SearchIcon />}
                    fullWidth
                  >
                    Search
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={clearFilters}
                    startIcon={<ClearIcon />}
                    fullWidth
                  >
                    Clear
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="body1" color="text.secondary">
          {loading ? 'Loading...' : `${pagination.total} jobs found`}
        </Typography>
        {user?.role === 'student' && (
          <Button
            variant="outlined"
            onClick={() => navigate('/student/applications')}
            startIcon={<WorkIcon />}
          >
            View My Applications
          </Button>
        )}
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Jobs Grid */}
      {loading ? (
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="80%" height={32} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />
                  <Skeleton variant="text" width="100%" height={60} sx={{ mb: 2 }} />
                  <Skeleton variant="text" width="50%" height={24} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : jobs.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <WorkIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No jobs found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Try adjusting your search criteria or check back later for new opportunities
          </Typography>
          <Button
            variant="contained"
            onClick={clearFilters}
            startIcon={<ClearIcon />}
          >
            Clear Filters
          </Button>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {jobs.map(renderJobCard)}
          </Grid>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={pagination.totalPages}
                page={pagination.currentPage}
                onChange={(_, page) => setPagination(prev => ({ ...prev, currentPage: page }))}
                color="primary"
                size={isMobile ? 'small' : 'medium'}
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default JobList;
