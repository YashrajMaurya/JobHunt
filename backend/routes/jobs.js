const express = require('express');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const router = express.Router();

// @desc    Get all jobs (public)
// @route   GET /api/jobs
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      field,
      type,
      experience,
      location,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { isActive: true };
    
    if (field && field !== 'all') {
      query.field = field;
    }
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (experience && experience !== 'all') {
      query.experience = experience;
    }
    
    if (location && location !== 'all') {
      query.location = { $regex: location, $options: 'i' };
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const jobs = await Job.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const total = await Job.countDocuments(query);

    // Increment view count for each job
    if (jobs.length > 0) {
      const jobIds = jobs.map(job => job._id);
      await Job.updateMany(
        { _id: { $in: jobIds } },
        { $inc: { views: 1 } }
      );
    }

    res.json({
      success: true,
      jobs,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('company', 'name companyName companyDescription companyLogo');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (!job.isActive) {
      return res.status(404).json({ message: 'Job is no longer active' });
    }

    // Increment view count
    await Job.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    // Check if user has already applied (if authenticated)
    let hasApplied = false;
    if (req.user && req.user.role === 'student') {
      const existingApplication = await Application.findOne({
        job: req.params.id,
        student: req.user.id
      });
      hasApplied = !!existingApplication;
    }

    res.json({
      success: true,
      job: {
        ...job.toObject(),
        hasApplied
      }
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Apply for a job
// @route   POST /api/jobs/:id/apply
// @access  Private (Student only)
router.post('/:id/apply', protect, authorize('student'), async (req, res) => {
  try {
    const { coverLetter } = req.body;

    // Check if job exists and is active
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (!job.isActive) {
      return res.status(400).json({ message: 'Job is no longer active' });
    }

    // Check if application deadline has passed
    if (new Date() > new Date(job.applicationDeadline)) {
      return res.status(400).json({ message: 'Application deadline has passed' });
    }

    // Check if user has already applied
    const existingApplication = await Application.findOne({
      job: req.params.id,
      student: req.user.id
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Check if user has a resume
    if (!req.user.resume || !req.user.resume.url) {
      return res.status(400).json({ message: 'Please upload your resume before applying' });
    }

    // Create application
    const application = await Application.create({
      job: req.params.id,
      student: req.user.id,
      recruiter: job.company,
      coverLetter: coverLetter || '',
      resume: req.user.resume
    });

    // Populate application with job and student details
    const populatedApplication = await Application.findById(application._id)
      .populate('job', 'title companyName field location type')
      .populate('student', 'name email field graduationYear profilePicture resume')
      .populate('recruiter', 'name companyName');

    // Emit real-time notification via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`recruiter-${job.company}`).emit('new-application', {
        application: populatedApplication
      });
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application: populatedApplication
    });
  } catch (error) {
    console.error('Apply for job error:', error);
    res.status(500).json({ message: 'Server error during application submission' });
  }
});

// @desc    Get job statistics
// @route   GET /api/jobs/stats/overview
// @access  Public
router.get('/stats/overview', async (req, res) => {
  try {
    const [totalJobs, activeJobs, totalApplications, fields] = await Promise.all([
      Job.countDocuments(),
      Job.countDocuments({ isActive: true }),
      Application.countDocuments(),
      Job.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$field', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        totalJobs,
        activeJobs,
        totalApplications,
        fields
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get popular jobs
// @route   GET /api/jobs/popular
// @access  Public
router.get('/popular', async (req, res) => {
  try {
    const popularJobs = await Job.find({ isActive: true })
      .sort({ views: -1, totalApplications: -1 })
      .limit(6)
      .select('title companyName field location type salary views totalApplications');

    res.json({
      success: true,
      jobs: popularJobs
    });
  } catch (error) {
    console.error('Get popular jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get jobs by field
// @route   GET /api/jobs/field/:field
// @access  Public
router.get('/field/:field', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const jobs = await Job.find({ 
      field: req.params.field, 
      isActive: true 
    })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('title companyName field location type salary applicationDeadline');

    const total = await Job.countDocuments({ 
      field: req.params.field, 
      isActive: true 
    });

    res.json({
      success: true,
      field: req.params.field,
      jobs,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get jobs by field error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
