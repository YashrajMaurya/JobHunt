import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Alert,
  useTheme,
  useMediaQuery,
  IconButton,
  InputAdornment} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
  Description as DescriptionIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    field: '',
    graduationYear: '',
    companyDescription: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        field: user.field || '',
        graduationYear: user.graduationYear || '',
        companyDescription: user.companyDescription || ''
      });
    }
  }, [user]);

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

    if (!formData.name) {
      newErrors.name = 'Name is required';
    }

    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (user?.role === 'student' && !formData.field) {
      newErrors.field = 'Field is required for students';
    }

    if (user?.role === 'student' && !formData.graduationYear) {
      newErrors.graduationYear = 'Graduation year is required for students';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const result = await updateProfile(formData);
      if (result.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      phone: user.phone || '',
      field: user.field || '',
      graduationYear: user.graduationYear || '',
      companyDescription: user.companyDescription || ''
    });
    setErrors({});
    setIsEditing(false);
  };

  const handleFileUpload = async (file, type) => {
    if (!file) return;

    const formData = new FormData();
    let endpoint;
    
    if (type === 'profile') {
      formData.append('image', file);
      endpoint = user.role === 'student' ? '/api/student/profile-picture' : '/api/recruiter/profile-picture';
    } else if (type === 'resume') {
      formData.append('resume', file);
      endpoint = '/api/student/resume';
    }

    try {
      setLoading(true);
      const response = await axios.post(endpoint, formData);

      if (response.data.success) {
        let successMessage = '';
        if (type === 'profile') {
          successMessage = 'Profile picture updated successfully!';
        } else if (type === 'resume') {
          successMessage = 'Resume updated successfully!';
        }
        
        setMessage({ type: 'success', text: successMessage });
        // Refresh user data
        window.location.reload();
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to upload ${type}. Please try again.` });
    } finally {
      setLoading(false);
    }
  };

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
          Profile Settings
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Manage your personal information and preferences
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

      <Grid container spacing={4}>
        {/* Profile Picture Section */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                <Avatar
                  src={user.profilePicture?.url}
                  sx={{
                    width: 120,
                    height: 120,
                    fontSize: '3rem',
                    border: `4px solid ${theme.palette.primary.main}`
                  }}
                >
                  {user.name?.charAt(0)}
                </Avatar>
                
                {(user.role === 'student' || user.role === 'recruiter') && (
                  <IconButton
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      backgroundColor: theme.palette.primary.main,
                      color: 'white',
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                      }
                    }}
                    onClick={() => document.getElementById('profile-picture-input').click()}
                    disabled={loading}
                  >
                    <PhotoCameraIcon />
                  </IconButton>
                )}
              </Box>

              <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
                {user.name}
              </Typography>
              
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {user.role === 'student' ? 'Student' : 'Recruiter'}
              </Typography>

              {user.role === 'student' && (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>Field:</strong> {user.field}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    <strong>Graduation Year:</strong> {user.graduationYear}
                  </Typography>
                </>
              )}

              {user.role === 'recruiter' && (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>Company:</strong> {user.companyName}
                  </Typography>
                  {user.companyDescription && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      <strong>Description:</strong> {user.companyDescription}
                    </Typography>
                  )}
                </>
              )}

              <input
                id="profile-picture-input"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => handleFileUpload(e.target.files[0], 'profile')}
              />
            </CardContent>
          </Card>

          {/* Resume Section (Students only) */}
          {user.role === 'student' && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Resume
                </Typography>
                
                {user.resume?.url ? (
                  <Box sx={{ textAlign: 'center' }}>
                    <DescriptionIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Resume uploaded
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      href={user.resume.viewUrl || user.resume.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      startIcon={<DescriptionIcon />}
                    >
                      View Resume
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center' }}>
                    <DescriptionIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      No resume uploaded
                    </Typography>
                  </Box>
                )}

                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<UploadIcon />}
                  onClick={() => document.getElementById('resume-input').click()}
                  disabled={loading}
                  sx={{ mt: 2 }}
                >
                  {user.resume?.url ? 'Update Resume' : 'Upload Resume'}
                </Button>

                <input
                  id="resume-input"
                  type="file"
                  accept=".pdf"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileUpload(e.target.files[0], 'resume')}
                />
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Profile Information Section */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                  Personal Information
                </Typography>
                <Box>
                  {isEditing ? (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={loading}
                        startIcon={<SaveIcon />}
                      >
                        {loading ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={handleCancel}
                        startIcon={<CancelIcon />}
                      >
                        Cancel
                      </Button>
                    </Box>
                  ) : (
                    <Button
                      variant="outlined"
                      onClick={() => setIsEditing(true)}
                      startIcon={<EditIcon />}
                    >
                      Edit Profile
                    </Button>
                  )}
                </Box>
              </Box>

              <Grid container spacing={3}>
                {/* Name */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    error={!!errors.name}
                    helperText={errors.name}
                    disabled={!isEditing}
                  />
                </Grid>

                {/* Phone */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    error={!!errors.phone}
                    helperText={errors.phone}
                    disabled={!isEditing}
                  />
                </Grid>

                {/* Email (Read-only) */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    value={user.email}
                    disabled
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Typography variant="caption" color="text.secondary">
                            Cannot be changed
                          </Typography>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Student-specific fields */}
                {user.role === 'student' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        select
                        label="Field of Study"
                        name="field"
                        value={formData.field}
                        onChange={handleChange}
                        error={!!errors.field}
                        helperText={errors.field}
                        disabled={!isEditing}
                      >
                        {fields.map((field) => (
                          <option key={field} value={field}>
                            {field}
                          </option>
                        ))}
                      </TextField>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        select
                        label="Graduation Year"
                        name="graduationYear"
                        value={formData.graduationYear}
                        onChange={handleChange}
                        error={!!errors.graduationYear}
                        helperText={errors.graduationYear}
                        disabled={!isEditing}
                      >
                        {graduationYears.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </TextField>
                    </Grid>
                  </>
                )}

                {/* Recruiter-specific fields */}
                {user.role === 'recruiter' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Company Description"
                      name="companyDescription"
                      value={formData.companyDescription}
                      onChange={handleChange}
                      multiline
                      rows={4}
                      disabled={!isEditing}
                      placeholder="Describe your company, culture, and what makes it a great place to work..."
                    />
                  </Grid>
                )}
              </Grid>

              {isEditing && (
                <Box sx={{ mt: 3, p: 2, backgroundColor: 'info.light', borderRadius: 1 }}>
                  <Typography variant="body2" color="info.contrastText">
                    <strong>Note:</strong> Some fields like email and role cannot be changed. 
                    Contact support if you need to modify these details.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

    </Container>
  );
};

export default Profile;
