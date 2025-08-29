const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// Multer configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'), false);
    }
  },
});

// @desc    Get recruiter profile
// @route   GET /api/recruiter/profile
// @access  Private (Recruiter only)
router.get('/profile', protect, authorize('recruiter'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePicture: user.profilePicture,
        companyName: user.companyName,
        companyDescription: user.companyDescription,
        companyLogo: user.companyLogo
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update recruiter profile
// @route   PUT /api/recruiter/profile
// @access  Private (Recruiter only)
router.put('/profile', protect, authorize('recruiter'), async (req, res) => {
  try {
    const { name, phone, companyDescription } = req.body;
    
    const fieldsToUpdate = {};
    if (name !== undefined) fieldsToUpdate.name = name;
    if (phone !== undefined) fieldsToUpdate.phone = phone;
    if (companyDescription !== undefined) fieldsToUpdate.companyDescription = companyDescription;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePicture: user.profilePicture,
        companyName: user.companyName,
        companyDescription: user.companyDescription,
        companyLogo: user.companyLogo
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
});

// @desc    Upload company logo
// @route   POST /api/recruiter/company-logo
// @access  Private (Recruiter only)
router.post('/company-logo', protect, authorize('recruiter'), upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a logo' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload_stream(
      {
        folder: 'jobhunt/logos',
        transformation: [
          { width: 300, height: 300, crop: 'fill' },
          { quality: 'auto' }
        ]
      },
      async (error, result) => {
        if (error) {
          return res.status(500).json({ message: 'Error uploading logo' });
        }

        try {
          // Delete old logo if exists
          const user = await User.findById(req.user.id);
          if (user.companyLogo && user.companyLogo.public_id) {
            await cloudinary.uploader.destroy(user.companyLogo.public_id);
          }

          // Update user company logo
          const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            {
              companyLogo: {
                public_id: result.public_id,
                url: result.secure_url
              }
            },
            { new: true }
          );

          res.json({
            success: true,
            companyLogo: updatedUser.companyLogo
          });
        } catch (updateError) {
          console.error('Company logo update error:', updateError);
          res.status(500).json({ message: 'Error updating company logo' });
        }
      }
    ).end(req.file.buffer);
  } catch (error) {
    console.error('Company logo upload error:', error);
    res.status(500).json({ message: 'Server error during upload' });
  }
});

// @desc    Upload profile picture
// @route   POST /api/recruiter/profile-picture
// @access  Private (Recruiter only)
router.post('/profile-picture', protect, authorize('recruiter'), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload_stream(
      {
        folder: 'jobhunt/profiles',
        transformation: [
          { width: 400, height: 400, crop: 'fill' },
          { quality: 'auto' }
        ]
      },
      async (error, result) => {
        if (error) {
          return res.status(500).json({ message: 'Error uploading image' });
        }

        try {
          // Delete old profile picture if exists
          const user = await User.findById(req.user.id);
          if (user.profilePicture && user.profilePicture.public_id) {
            await cloudinary.uploader.destroy(user.profilePicture.public_id);
          }

          // Update user profile picture
          const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            {
              profilePicture: {
                public_id: result.public_id,
                url: result.secure_url
              }
            },
            { new: true }
          );

          res.json({
            success: true,
            profilePicture: updatedUser.profilePicture
          });
        } catch (updateError) {
          console.error('Profile picture update error:', updateError);
          res.status(500).json({ message: 'Error updating profile picture' });
        }
      }
    ).end(req.file.buffer);
  } catch (error) {
    console.error('Profile picture upload error:', error);
    res.status(500).json({ message: 'Server error during upload' });
  }
});

// @desc    Create a new job
// @route   POST /api/recruiter/jobs
// @access  Private (Recruiter only)
router.post('/jobs', protect, authorize('recruiter'), async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      field,
      location,
      type,
      experience,
      salaryMin,
      salaryMax,
      skills,
      benefits,
      applicationDeadline
    } = req.body;

    // Validate required fields
    if (!title || !description || !requirements || !field || !location || !type || !experience || !salaryMin || !salaryMax || !applicationDeadline) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Create job
    const job = await Job.create({
      title,
      company: req.user.id,
      companyName: req.user.companyName,
      description,
      requirements,
      field,
      location,
      type,
      experience,
      salary: {
        min: salaryMin,
        max: salaryMax,
        currency: 'INR'
      },
      skills: skills ? skills.split(',').map(skill => skill.trim()) : [],
      benefits: benefits ? benefits.split(',').map(benefit => benefit.trim()) : [],
      applicationDeadline: new Date(applicationDeadline)
    });

    res.status(201).json({
      success: true,
      job
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ message: 'Server error during job creation' });
  }
});

// @desc    Get recruiter's jobs
// @route   GET /api/recruiter/jobs
// @access  Private (Recruiter only)
router.get('/jobs', protect, authorize('recruiter'), async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = { company: req.user.id };
    if (status && status !== 'all') {
      query.isActive = status === 'active';
    }

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Job.countDocuments(query);

    res.json({
      success: true,
      jobs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update job
// @route   PUT /api/recruiter/jobs/:id
// @access  Private (Recruiter only)
router.put('/jobs/:id', protect, authorize('recruiter'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.company.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      job: updatedJob
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Server error during job update' });
  }
});

// @desc    Delete job
// @route   DELETE /api/recruiter/jobs/:id
// @access  Private (Recruiter only)
router.delete('/jobs/:id', protect, authorize('recruiter'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.company.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Server error during job deletion' });
  }
});

// @desc    Get applications for a job
// @route   GET /api/recruiter/jobs/:id/applications
// @access  Private (Recruiter only)
router.get('/jobs/:id/applications', protect, authorize('recruiter'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.company.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view applications for this job' });
    }

    const applications = await Application.find({ job: req.params.id })
      .populate('student', 'name email phone field graduationYear profilePicture resume')
      .populate('job', 'title companyName field location type salary')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update application status
// @route   PUT /api/recruiter/applications/:id
// @access  Private (Recruiter only)
router.put('/applications/:id', protect, authorize('recruiter'), async (req, res) => {
  try {
    const { status, recruiterNotes, interviewDate, interviewLocation, interviewType } = req.body;

    const application = await Application.findById(req.params.id)
      .populate('job', 'company');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.job.company.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this application' });
    }

    const updateFields = { status };
    if (recruiterNotes !== undefined) updateFields.recruiterNotes = recruiterNotes;
    if (interviewDate !== undefined) updateFields.interviewDate = interviewDate;
    if (interviewLocation !== undefined) updateFields.interviewLocation = interviewLocation;
    if (interviewType !== undefined) updateFields.interviewType = interviewType;
    
    if (status !== 'pending') {
      updateFields.reviewedAt = new Date();
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    ).populate('student', 'name email field graduationYear profilePicture resume');

    // Emit real-time update via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`student-${application.student}`).emit('application-updated', {
        applicationId: updatedApplication._id,
        status: updatedApplication.status,
        recruiterNotes: updatedApplication.recruiterNotes,
        interviewDate: updatedApplication.interviewDate,
        interviewLocation: updatedApplication.interviewLocation,
        interviewType: updatedApplication.interviewType
      });
    }

    res.json({
      success: true,
      application: updatedApplication
    });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({ message: 'Server error during application update' });
  }
});

// @desc    Get recruiter dashboard stats
// @route   GET /api/recruiter/dashboard
// @access  Private (Recruiter only)
router.get('/dashboard', protect, authorize('recruiter'), async (req, res) => {
  try {
    const [totalJobs, activeJobs, totalApplications, pendingApplications] = await Promise.all([
      Job.countDocuments({ company: req.user.id }),
      Job.countDocuments({ company: req.user.id, isActive: true }),
      Application.countDocuments({ recruiter: req.user.id }),
      Application.countDocuments({ recruiter: req.user.id, status: 'pending' })
    ]);

    res.json({
      success: true,
      stats: {
        totalJobs,
        activeJobs,
        totalApplications,
        pendingApplications
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
