import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  useTheme,
  useMediaQuery,
  Skeleton,
  Paper,
  IconButton
} from '@mui/material';
import {
  Work as WorkIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  School as SchoolIcon,
  Description as DescriptionIcon,
  Send as SendIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const JobDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applicationDialog, setApplicationDialog] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [applicationError, setApplicationError] = useState(null);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`/api/jobs/${id}`);
      
      if (response.data.success) {
        setJob(response.data.job);
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
      setError('Failed to fetch job details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'student') {
      setApplicationError('Only students can apply for jobs.');
      return;
    }

    if (!user.resume?.url) {
      setApplicationError('Please upload your resume before applying.');
      return;
    }

    setApplicationDialog(true);
    setApplicationError(null);
  };

  const submitApplication = async () => {
    try {
      setSubmitting(true);
      setApplicationError(null);

      const response = await axios.post(`/api/jobs/${id}/apply`, {
        coverLetter: coverLetter.trim()
      });

      if (response.data.success) {
        setApplicationDialog(false);
        setCoverLetter('');
        // Refresh job details to update hasApplied status
        fetchJobDetails();
        // Show success message or redirect
        navigate('/student/applications');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      setApplicationError(error.response?.data?.message || 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatSalary = (min, max) => {
    return `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="80%" height={40} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="60%" height={24} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="100%" height={100} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="90%" height={100} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error || !job) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Job not found'}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/jobs')}>
          Back to Jobs
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Error Alert */}
      {applicationError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setApplicationError(null)}>
          {applicationError}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Main Job Content */}
        <Grid item xs={12} md={8}>
          {/* Job Header */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  {job.title}
                </Typography>
                <Chip
                  label={job.type}
                  color="primary"
                  variant="outlined"
                  size="large"
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="h6" color="text.secondary">
                  {job.companyName}
                </Typography>
              </Box>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body1">
                      {job.location}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <SchoolIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body1">
                      {job.field}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <ScheduleIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body1">
                      {job.experience}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <MoneyIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {formatSalary(job.salary.min, job.salary.max)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Application Deadline */}
              <Box sx={{ 
                p: 2, 
                backgroundColor: isDeadlinePassed(job.applicationDeadline) ? 'error.light' : 'warning.light',
                borderRadius: 1,
                textAlign: 'center'
              }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {isDeadlinePassed(job.applicationDeadline) 
                    ? 'Application Deadline Passed' 
                    : `Application Deadline: ${formatDate(job.applicationDeadline)}`
                  }
                </Typography>
                {!isDeadlinePassed(job.applicationDeadline) && (
                  <Typography variant="body2" color="text.secondary">
                    {getDaysUntilDeadline(job.applicationDeadline)} days remaining
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
                Job Description
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {job.description}
              </Typography>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
                Requirements
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {job.requirements}
              </Typography>
            </CardContent>
          </Card>

          {/* Skills and Benefits */}
          <Grid container spacing={3}>
            {job.skills && job.skills.length > 0 && (
              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Required Skills
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {job.skills.map((skill, index) => (
                        <Chip
                          key={index}
                          label={skill}
                          variant="outlined"
                          size="small"
                          color="primary"
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {job.benefits && job.benefits.length > 0 && (
              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Benefits
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {job.benefits.map((benefit, index) => (
                        <Chip
                          key={index}
                          label={benefit}
                          variant="outlined"
                          size="small"
                          color="secondary"
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 20 }}>
            <CardContent>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', mb: 3 }}>
                Job Summary
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Posted on {formatDate(job.createdAt)}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {job.totalApplications} applications received
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {job.views} views
                </Typography>
                <Typography 
                  variant="body2" 
                  color={isDeadlinePassed(job.applicationDeadline) ? 'error.main' : 'text.secondary'}
                  sx={{ fontWeight: isDeadlinePassed(job.applicationDeadline) ? 'bold' : 'normal' }}
                >
                  {getDeadlineText(job.applicationDeadline)}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Apply Button */}
              {user?.role === 'student' ? (
                <Box>
                  {job.hasApplied ? (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      You have already applied for this job
                    </Alert>
                  ) : (
                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      onClick={handleApply}
                      disabled={isDeadlinePassed(job.applicationDeadline)}
                      startIcon={<SendIcon />}
                      sx={{ mb: 2 }}
                    >
                      {isDeadlinePassed(job.applicationDeadline) ? 'Deadline Passed' : 'Apply Now'}
                    </Button>
                  )}
                  
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/jobs')}
                    startIcon={<WorkIcon />}
                  >
                    Browse More Jobs
                  </Button>
                </Box>
              ) : user?.role === 'recruiter' ? (
                <Box>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    This is a job posting from another company
                  </Alert>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/recruiter/create-job')}
                    startIcon={<WorkIcon />}
                  >
                    Post Your Own Job
                  </Button>
                </Box>
              ) : (
                <Box>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Please log in as a student to apply for this job
                  </Alert>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate('/login')}
                    startIcon={<WorkIcon />}
                  >
                    Login to Apply
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Application Dialog */}
      <Dialog
        open={applicationDialog}
        onClose={() => setApplicationDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Apply for {job.title}</Typography>
            <IconButton onClick={() => setApplicationDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            You are applying to {job.companyName} for the position of {job.title}
          </Typography>
          
          <TextField
            fullWidth
            label="Cover Letter (Optional)"
            multiline
            rows={6}
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="Tell the employer why you're interested in this position and why you'd be a great fit..."
            sx={{ mb: 2 }}
          />

          <Alert severity="info">
            Your resume will be automatically attached to this application
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApplicationDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={submitApplication}
            variant="contained"
            disabled={submitting}
            startIcon={<SendIcon />}
          >
            {submitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default JobDetail;
