const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const User = require('../models/User');
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
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDFs are allowed'), false);
    }
  },
});

// @desc    Get student profile
// @route   GET /api/student/profile
// @access  Private (Student only)
router.get('/profile', protect, authorize('student'), async (req, res) => {
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
        resume: user.resume,
        field: user.field,
        graduationYear: user.graduationYear
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update student profile
// @route   PUT /api/student/profile
// @access  Private (Student only)
router.put('/profile', protect, authorize('student'), async (req, res) => {
  try {
    const { name, phone, field, graduationYear } = req.body;
    
    const fieldsToUpdate = {};
    if (name !== undefined) fieldsToUpdate.name = name;
    if (phone !== undefined) fieldsToUpdate.phone = phone;
    if (field !== undefined) fieldsToUpdate.field = field;
    if (graduationYear !== undefined) fieldsToUpdate.graduationYear = graduationYear;

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
        resume: user.resume,
        field: user.field,
        graduationYear: user.graduationYear
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
});

// @desc    Upload profile picture
// @route   POST /api/student/profile-picture
// @access  Private (Student only)
router.post('/profile-picture', protect, authorize('student'), upload.single('image'), async (req, res) => {
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

// @desc    Upload resume
// @route   POST /api/student/resume
// @access  Private (Student only)
router.post('/resume', protect, authorize('student'), upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a resume' });
    }

    // Upload to Cloudinary as a raw resource (best for documents)
    const result = await cloudinary.uploader.upload_stream(
      {
        folder: 'jobhunt/resumes',
        resource_type: 'raw',
        format: 'pdf',
        use_filename: true,
        unique_filename: false
      },
      async (error, result) => {
        if (error) {
          return res.status(500).json({ message: 'Error uploading resume' });
        }

        try {
          // Delete old resume if exists
          const user = await User.findById(req.user.id);
          if (user.resume && user.resume.public_id) {
            await cloudinary.uploader.destroy(user.resume.public_id, { resource_type: 'raw' });
          }

          // Build an inline-view URL for the PDF to ensure it opens in the browser
          const viewUrl = cloudinary.url(result.public_id, {
            resource_type: 'raw',
            flags: 'inline',
            format: 'pdf',
            secure: true
          });

          // Update user resume
          const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            {
              resume: {
                public_id: result.public_id,
                url: result.secure_url,
                viewUrl
              }
            },
            { new: true }
          );

          res.json({
            success: true,
            resume: updatedUser.resume
          });
        } catch (updateError) {
          console.error('Resume update error:', updateError);
          res.status(500).json({ message: 'Error updating resume' });
        }
      }
    ).end(req.file.buffer);
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ message: 'Server error during upload' });
  }
});

// @desc    Get student applications
// @route   GET /api/student/applications
// @access  Private (Student only)
router.get('/applications', protect, authorize('student'), async (req, res) => {
  try {
    const applications = await Application.find({ student: req.user.id })
      .populate('job', 'title companyName field location type')
      .populate('recruiter', 'name companyName')
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

// @desc    Get student dashboard stats
// @route   GET /api/student/dashboard
// @access  Private (Student only)
router.get('/dashboard', protect, authorize('student'), async (req, res) => {
  try {
    const [totalApplications, pendingApplications, acceptedApplications, rejectedApplications] = await Promise.all([
      Application.countDocuments({ student: req.user.id }),
      Application.countDocuments({ student: req.user.id, status: 'pending' }),
      Application.countDocuments({ student: req.user.id, status: 'accepted' }),
      Application.countDocuments({ student: req.user.id, status: 'rejected' })
    ]);

    res.json({
      success: true,
      stats: {
        totalApplications,
        pendingApplications,
        acceptedApplications,
        rejectedApplications
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
