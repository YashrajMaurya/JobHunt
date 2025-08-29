import { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  useTheme,
  useMediaQuery,
  InputAdornment
} from '@mui/material';
import {
  Save as SaveIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const CreateJob = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    field: '',
    location: '',
    type: '',
    experience: '',
    salaryMin: '',
    salaryMax: '',
    skills: '',
    benefits: '',
    applicationDeadline: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title) {
      newErrors.title = 'Job title is required';
    }

    if (!formData.description) {
      newErrors.description = 'Job description is required';
    }

    if (!formData.requirements) {
      newErrors.requirements = 'Job requirements are required';
    }

    if (!formData.field) {
      newErrors.field = 'Field is required';
    }

    if (!formData.location) {
      newErrors.location = 'Location is required';
    }

    if (!formData.type) {
      newErrors.type = 'Job type is required';
    }

    if (!formData.experience) {
      newErrors.experience = 'Experience level is required';
    }

    if (!formData.salaryMin) {
      newErrors.salaryMin = 'Minimum salary is required';
    }

    if (!formData.salaryMax) {
      newErrors.salaryMax = 'Maximum salary is required';
    }

    if (formData.salaryMin && formData.salaryMax && 
        parseInt(formData.salaryMin) >= parseInt(formData.salaryMax)) {
      newErrors.salaryMax = 'Maximum salary must be greater than minimum salary';
    }

    if (!formData.applicationDeadline) {
      newErrors.applicationDeadline = 'Application deadline is required';
    }

    if (formData.applicationDeadline) {
      const deadline = new Date(formData.applicationDeadline);
      const now = new Date();
      if (deadline <= now) {
        newErrors.applicationDeadline = 'Application deadline must be in the future';
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

    setLoading(true);
    try {
      const response = await axios.post('/api/recruiter/jobs', {
        ...formData,
        salaryMin: parseInt(formData.salaryMin),
        salaryMax: parseInt(formData.salaryMax)
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Job posted successfully!' });
        // Reset form
        setFormData({
          title: '',
          description: '',
          requirements: '',
          field: '',
          location: '',
          type: '',
          experience: '',
          salaryMin: '',
          salaryMax: '',
          skills: '',
          benefits: '',
          applicationDeadline: ''
        });
        setErrors({});
        
        // Redirect to jobs list after a short delay
        setTimeout(() => {
          navigate('/recruiter/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Error creating job:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to create job. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      title: '',
      description: '',
      requirements: '',
      field: '',
      location: '',
      type: '',
      experience: '',
      salaryMin: '',
      salaryMax: '',
      skills: '',
      benefits: '',
      applicationDeadline: ''
    });
    setErrors({});
    setMessage(null);
  };

  if (!user || user.role !== 'recruiter') {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Only recruiters can access this page.
        </Alert>
      </Container>
    );
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
          Post a New Job
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Create a compelling job posting to attract talented candidates
        </Typography>
      </Box>

      {/* Message Alert */}
      {message && (
        <Alert 
          severity={message.type} 
          sx={{ mb: 3 }} 
          onClose={() => setMessage(null)}
        >
          {message.text}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Job Title */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Job Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  error={!!errors.title}
                  helperText={errors.title}
                  placeholder="e.g., Software Engineer, Marketing Intern, etc."
                  required
                />
              </Grid>

              {/* Field and Location */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!errors.field} sx={{ minWidth: 200 }}>
                  <InputLabel shrink sx={{ whiteSpace: 'nowrap' }}>Field</InputLabel>
                  <Select
                    name="field"
                    value={formData.field}
                    label="Field"
                    onChange={handleChange}
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
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  error={!!errors.location}
                  helperText={errors.location}
                  placeholder="e.g., Mumbai, Remote, Hybrid"
                  required
                />
              </Grid>

              {/* Job Type and Experience */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!errors.type} sx={{ minWidth: 200 }}>
                  <InputLabel shrink sx={{ whiteSpace: 'nowrap' }}>Job Type</InputLabel>
                  <Select
                    name="type"
                    value={formData.type}
                    label="Job Type"
                    onChange={handleChange}
                  >
                    {jobTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.type && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                      {errors.type}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!errors.experience} sx={{ minWidth: 200 }}>
                  <InputLabel shrink sx={{ whiteSpace: 'nowrap' }}>Experience Level</InputLabel>
                  <Select
                    name="experience"
                    value={formData.experience}
                    label="Experience Level"
                    onChange={handleChange}
                  >
                    {experienceLevels.map((level) => (
                      <MenuItem key={level} value={level}>
                        {level}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.experience && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                      {errors.experience}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Salary Range */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Minimum Salary (₹)"
                  name="salaryMin"
                  type="number"
                  value={formData.salaryMin}
                  onChange={handleChange}
                  error={!!errors.salaryMin}
                  helperText={errors.salaryMin}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                  placeholder="e.g., 25000"
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Maximum Salary (₹)"
                  name="salaryMax"
                  type="number"
                  value={formData.salaryMax}
                  onChange={handleChange}
                  error={!!errors.salaryMax}
                  helperText={errors.salaryMax}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                  placeholder="e.g., 50000"
                  required
                />
              </Grid>

              {/* Application Deadline */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Application Deadline"
                  name="applicationDeadline"
                  type="datetime-local"
                  value={formData.applicationDeadline}
                  onChange={handleChange}
                  error={!!errors.applicationDeadline}
                  helperText={errors.applicationDeadline}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  required
                />
              </Grid>

              {/* Skills */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Required Skills (comma-separated)"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="e.g., JavaScript, React, Node.js"
                  helperText="Separate multiple skills with commas"
                />
              </Grid>

              {/* Job Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Job Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  error={!!errors.description}
                  helperText={errors.description}
                  multiline
                  rows={6}
                  placeholder="Provide a detailed description of the role, responsibilities, and what the candidate will be doing..."
                  required
                />
              </Grid>

              {/* Requirements */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Job Requirements"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  error={!!errors.requirements}
                  helperText={errors.requirements}
                  multiline
                  rows={4}
                  placeholder="List the specific requirements, qualifications, and skills needed for this position..."
                  required
                />
              </Grid>

              {/* Benefits */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Benefits & Perks (comma-separated)"
                  name="benefits"
                  value={formData.benefits}
                  onChange={handleChange}
                  placeholder="e.g., Health Insurance, Flexible Hours, Remote Work"
                  helperText="Separate multiple benefits with commas"
                />
              </Grid>
            </Grid>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
              <Button
                variant="outlined"
                onClick={handleClear}
                startIcon={<ClearIcon />}
                disabled={loading}
              >
                Clear Form
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? null : <SaveIcon />}
                sx={{ minWidth: 120 }}
              >
                {loading ? 'Creating...' : 'Post Job'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tips Section */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
            💡 Tips for a Great Job Posting
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                • <strong>Be specific</strong> about requirements and responsibilities
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                • <strong>Highlight benefits</strong> that make your company attractive
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • <strong>Use clear language</strong> and avoid jargon
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                • <strong>Set realistic deadlines</strong> for applications
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                • <strong>Include salary range</strong> to attract suitable candidates
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • <strong>Proofread</strong> your posting before publishing
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CreateJob;
