import React, { useState, useEffect, useCallback } from 'react';
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
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  useTheme,
  useMediaQuery,
  Pagination
} from '@mui/material';
import {
  Work as WorkIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';

const Applications = () => {
  const { user } = useAuth();
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    search: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [applicationDialog, setApplicationDialog] = useState(false);
  const [updateDialog, setUpdateDialog] = useState(false);
  const [applicantDialog, setApplicantDialog] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: '',
    recruiterNotes: '',
    interviewDate: '',
    interviewLocation: '',
    interviewType: ''
  });
  const [message, setMessage] = useState(null);

  const { listenToEvent } = useSocket?.() || { listenToEvent: null };

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📋 Fetching applications for user:', user?.role, user?.id);
      console.log('🌐 API URL:', axios.defaults.baseURL);

      // If recruiter is viewing applications for a specific job, use the job-specific endpoint
      if (user?.role === 'recruiter' && jobId) {
        console.log('👔 Fetching recruiter job-specific applications for job:', jobId);
        const response = await axios.get(`/api/recruiter/jobs/${jobId}/applications`);
        console.log('✅ Recruiter applications response:', response.data);
        
        if (response.data.success) {
          setApplications(response.data.applications || []);
          setPagination(prev => ({ ...prev, totalPages: 1, total: response.data.count || (response.data.applications || []).length }));
        }
      } else {
        console.log('👨‍🎓 Fetching student applications with filters:', filters);
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
        
        const endpoint = `/api/applications/search?${params}`;
        console.log('🔗 Calling endpoint:', endpoint);
        
        const response = await axios.get(endpoint);
        console.log('✅ Student applications response:', response.data);
        
        if (response.data.success) {
          setApplications(response.data.applications);
          setPagination(prev => ({
            ...prev,
            totalPages: response.data.totalPages,
            total: response.data.total
          }));
        }
      }
    } catch (error) {
      console.error('❌ Error fetching applications:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL
        }
      });
      setError('Failed to fetch applications. Please try again.');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.search, pagination.currentPage, user?.role, jobId]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Listen for socket events to refresh list in real-time
  useEffect(() => {
    if (!listenToEvent) return;

    const cleanupUpdated = listenToEvent('application-updated', () => {
      fetchApplications();
    });

    const cleanupNew = listenToEvent('new-application', () => {
      fetchApplications();
    });

    const cleanupWithdrawn = listenToEvent('application-withdrawn', () => {
      fetchApplications();
    });

    return () => {
      cleanupUpdated?.();
      cleanupNew?.();
      cleanupWithdrawn?.();
    };
  }, [listenToEvent, fetchApplications]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setApplicationDialog(true);
  };

  const handleUpdateApplication = (application) => {
    setSelectedApplication(application);
    setUpdateData({
      status: application.status,
      recruiterNotes: application.recruiterNotes || '',
      interviewDate: application.interviewDate ? new Date(application.interviewDate).toISOString().slice(0, 16) : '',
      interviewLocation: application.interviewLocation || '',
      interviewType: application.interviewType || ''
    });
    setUpdateDialog(true);
  };

  const handleViewApplicant = (application) => {
    setSelectedApplication(application);
    setApplicantDialog(true);
  };

  const submitUpdate = async () => {
    try {
      const response = await axios.put(`/api/recruiter/applications/${selectedApplication._id}`, updateData);
      
      if (response.data.success) {
        setUpdateDialog(false);
        fetchApplications(); // Refresh the list
        setMessage({ type: 'success', text: 'Application updated successfully!' });
      }
    } catch (error) {
      console.error('Error updating application:', error);
      setMessage({ type: 'error', text: 'Failed to update application. Please try again.' });
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
      case 'withdrawn':
        return 'default';
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
        return <ScheduleIcon />;
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
    const safeMin = typeof min === 'number' ? min : (min ? Number(min) : null);
    const safeMax = typeof max === 'number' ? max : (max ? Number(max) : null);
    if (!safeMin && !safeMax) return 'Not specified';
    if (!safeMin) return `₹${safeMax.toLocaleString()}`;
    if (!safeMax) return `₹${safeMin.toLocaleString()}`;
    return `₹${safeMin.toLocaleString()} - ₹${safeMax.toLocaleString()}`;
  };

  if (!user) {
    return null;
  }

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
          {user.role === 'student' ? 'My Applications' : 'Applications Management'}
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {user.role === 'student' 
            ? 'Track the status of your job applications' 
            : 'Review and manage applications from candidates'
          }
        </Typography>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                placeholder="Search applications..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel shrink sx={{ whiteSpace: 'nowrap' }}>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="accepted">Accepted</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                  {user.role === 'student' && (
                    <MenuItem value="withdrawn">Withdrawn</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={5}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setFilters({ status: 'all', search: '' });
                    setPagination(prev => ({ ...prev, currentPage: 1 }));
                  }}
                >
                  Clear Filters
                </Button>
                {user.role === 'student' && (
                  <Button
                    variant="contained"
                    onClick={() => navigate('/jobs')}
                    startIcon={<WorkIcon />}
                  >
                    Browse More Jobs
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Success/Info Alert */}
      {message && (
        <Alert 
          severity={message.type} 
          sx={{ mb: 3 }} 
          onClose={() => setMessage(null)}
        >
          {message.text}
        </Alert>
      )}

      {/* Applications List */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography>Loading applications...</Typography>
        </Box>
      ) : applications.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <WorkIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No applications found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {user.role === 'student' 
              ? 'Start applying to jobs to see your applications here'
              : 'Applications from candidates will appear here'
            }
          </Typography>
          {user.role === 'student' && (
            <Button
              variant="contained"
              onClick={() => navigate('/jobs')}
              startIcon={<WorkIcon />}
            >
              Browse Jobs
            </Button>
          )}
        </Box>
      ) : (
        <>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                  Applications ({pagination.total})
                </Typography>
              </Box>

              <List>
                {applications.map((application, index) => (
                  <React.Fragment key={application._id}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {user.role === 'student' 
                            ? application.job?.companyName?.charAt(0) || 'C'
                            : application.student?.name?.charAt(0) || 'S'
                          }
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {user.role === 'student' 
                                ? application.job?.title 
                                : `${application.student?.name} - ${application.job?.title}`
                              }
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
                              {user.role === 'student' 
                                ? `${application.job?.companyName} • ${application.job?.field} • ${application.job?.location}`
                                : `${application.student?.field} • ${application.student?.graduationYear} • ${application.job?.companyName}`
                              }
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Salary: {formatSalary(application.job?.salary?.min, application.job?.salary?.max)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Applied on {formatDate(application.appliedAt)}
                            </Typography>
                          </Box>
                        }
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleViewApplication(application)}
                          startIcon={<ViewIcon />}
                        >
                          View
                        </Button>
                        {user.role === 'recruiter' && (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleViewApplicant(application)}
                            startIcon={<PersonIcon />}
                          >
                            Applicant
                          </Button>
                        )}
                        {user.role === 'recruiter' && application.status === 'pending' && (
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleUpdateApplication(application)}
                            startIcon={<EditIcon />}
                          >
                            Update
                          </Button>
                        )}
                      </Box>
                    </ListItem>
                    {index < applications.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>

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

      {/* Application Detail Dialog */}
      <Dialog
        open={applicationDialog}
        onClose={() => setApplicationDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">Application Details</Typography>
        </DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Job Information</Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Title:</strong> {selectedApplication.job?.title}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Company:</strong> {selectedApplication.job?.companyName}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Field:</strong> {selectedApplication.job?.field}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Location:</strong> {selectedApplication.job?.location}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Type:</strong> {selectedApplication.job?.type}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Salary:</strong> {formatSalary(selectedApplication.job?.salary?.min, selectedApplication.job?.salary?.max)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Application Details</Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Status:</strong> 
                    <Chip
                      label={selectedApplication.status}
                      color={getStatusColor(selectedApplication.status)}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Applied:</strong> {formatDate(selectedApplication.appliedAt)}
                  </Typography>
                  {selectedApplication.coverLetter && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Cover Letter:</strong>
                    </Typography>
                  )}
                  {selectedApplication.coverLetter && (
                    <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1, mb: 2 }}>
                      <Typography variant="body2">
                        {selectedApplication.coverLetter}
                      </Typography>
                    </Box>
                  )}
                  {selectedApplication.recruiterNotes && (
                    <>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Recruiter Notes:</strong>
                      </Typography>
                      <Box sx={{ p: 2, backgroundColor: 'info.light', borderRadius: 1 }}>
                        <Typography variant="body2">
                          {selectedApplication.recruiterNotes}
                        </Typography>
                      </Box>
                    </>
                  )}
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApplicationDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Applicant Profile Dialog (Recruiter) */}
      <Dialog
        open={applicantDialog}
        onClose={() => setApplicantDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">Applicant Profile</Typography>
        </DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {selectedApplication.student?.name?.charAt(0) || 'A'}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {selectedApplication.student?.name || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedApplication.student?.email || 'N/A'}
                  </Typography>
                </Box>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Phone:</strong> {selectedApplication.student?.phone || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Field:</strong> {selectedApplication.student?.field || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Graduation Year:</strong> {selectedApplication.student?.graduationYear || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  href={selectedApplication.student?.resume?.viewUrl || selectedApplication.student?.resume?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Resume
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApplicantDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Update Application Dialog */}
      <Dialog
        open={updateDialog}
        onClose={() => setUpdateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">Update Application Status</Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel shrink sx={{ whiteSpace: 'nowrap' }}>Status</InputLabel>
                <Select
                  value={updateData.status}
                  label="Status"
                  onChange={(e) => setUpdateData(prev => ({ ...prev, status: e.target.value }))}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="accepted">Accepted</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Recruiter Notes"
                multiline
                rows={3}
                value={updateData.recruiterNotes}
                onChange={(e) => setUpdateData(prev => ({ ...prev, recruiterNotes: e.target.value }))}
                placeholder="Add notes about the candidate or application..."
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Interview Date"
                type="datetime-local"
                value={updateData.interviewDate}
                onChange={(e) => setUpdateData(prev => ({ ...prev, interviewDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Interview Location"
                value={updateData.interviewLocation}
                onChange={(e) => setUpdateData(prev => ({ ...prev, interviewLocation: e.target.value }))}
                placeholder="e.g., Office, Zoom, Phone"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateDialog(false)}>
            Cancel
          </Button>
          <Button onClick={submitUpdate} variant="contained">
            Update Application
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Applications;
