const express = require('express');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// @desc    Get all applications (for admin purposes)
// @route   GET /api/applications
// @access  Private (Admin only - can be extended later)
router.get('/', protect, async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('job', 'title companyName field')
      .populate('student', 'name email field')
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

// @desc    Get application statistics
// @route   GET /api/applications/stats/overview
// @access  Private
router.get('/stats/overview', protect, async (req, res) => {
  try {
    let query = {};
    
    // Filter by user role
    if (req.user.role === 'student') {
      query.student = req.user.id;
    } else if (req.user.role === 'recruiter') {
      query.recruiter = req.user.id;
    }

    const [totalApplications, pendingApplications, acceptedApplications, rejectedApplications, withdrawnApplications] = await Promise.all([
      Application.countDocuments(query),
      Application.countDocuments({ ...query, status: 'pending' }),
      Application.countDocuments({ ...query, status: 'accepted' }),
      Application.countDocuments({ ...query, status: 'rejected' }),
      Application.countDocuments({ ...query, status: 'withdrawn' })
    ]);

    // Get applications by status for charts
    const applicationsByStatus = await Application.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get applications by month for trends
    const applicationsByMonth = await Application.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    res.json({
      success: true,
      stats: {
        totalApplications,
        pendingApplications,
        acceptedApplications,
        rejectedApplications,
        withdrawnApplications,
        applicationsByStatus,
        applicationsByMonth
      }
    });
  } catch (error) {
    console.error('Get application stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Search applications
// @route   GET /api/applications/search
// @access  Private
router.get('/search', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Build query based on user role
    let query = {};
    
    if (req.user.role === 'student') {
      query.student = req.user.id;
    } else if (req.user.role === 'recruiter') {
      query.recruiter = req.user.id;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      if (req.user.role === 'student') {
        // Students can search by job title or company name
        const jobs = await Job.find({
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { companyName: { $regex: search, $options: 'i' } }
          ]
        }).select('_id');
        
        query.job = { $in: jobs.map(job => job._id) };
      } else if (req.user.role === 'recruiter') {
        // Recruiters can search by student name or field
        const students = await User.find({
          role: 'student',
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { field: { $regex: search, $options: 'i' } }
          ]
        }).select('_id');
        
        query.student = { $in: students.map(student => student._id) };
      }
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const applications = await Application.find(query)
      .populate('job', 'title companyName field location type')
      .populate('student', 'name email phone field graduationYear')
      .populate('recruiter', 'name email phone companyName')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Application.countDocuments(query);

    res.json({
      success: true,
      applications,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Search applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get application by ID
// @route   GET /api/applications/:id
// @access  Private
router.get('/:id([0-9a-fA-F]{24})', protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('job', 'title companyName field location type description requirements')
      .populate('student', 'name email phone field graduationYear profilePicture resume')
      .populate('recruiter', 'name email phone companyName companyDescription companyLogo');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if user is authorized to view this application
    if (req.user.role === 'student' && application.student.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this application' });
    }

    if (req.user.role === 'recruiter' && application.recruiter.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this application' });
    }

    res.json({
      success: true,
      application
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Withdraw application (Student only)
// @route   PUT /api/applications/:id/withdraw
// @access  Private (Student only)
router.put('/:id([0-9a-fA-F]{24})/withdraw', protect, authorize('student'), async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.student.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to withdraw this application' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot withdraw application that is not pending' });
    }

    application.status = 'withdrawn';
    await application.save();

    // Emit real-time update via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`recruiter-${application.recruiter}`).emit('application-withdrawn', {
        applicationId: application._id,
        studentName: req.user.name
      });
    }

    res.json({
      success: true,
      message: 'Application withdrawn successfully',
      application
    });
  } catch (error) {
    console.error('Withdraw application error:', error);
    res.status(500).json({ message: 'Server error during withdrawal' });
  }
});

// (stats and search routes moved above to prevent param route conflicts)

// @desc    Bulk update application statuses
// @route   PUT /api/applications/bulk-update
// @access  Private (Recruiter only)
router.put('/bulk-update', protect, authorize('recruiter'), async (req, res) => {
  try {
    const { applicationIds, status, recruiterNotes } = req.body;

    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return res.status(400).json({ message: 'Please provide application IDs' });
    }

    if (!status) {
      return res.status(400).json({ message: 'Please provide status' });
    }

    // Verify all applications belong to the recruiter
    const applications = await Application.find({
      _id: { $in: applicationIds },
      recruiter: req.user.id
    });

    if (applications.length !== applicationIds.length) {
      return res.status(400).json({ message: 'Some applications not found or not authorized' });
    }

    // Update applications
    const updateFields = { status };
    if (recruiterNotes !== undefined) updateFields.recruiterNotes = recruiterNotes;
    
    if (status !== 'pending') {
      updateFields.reviewedAt = new Date();
    }

    await Application.updateMany(
      { _id: { $in: applicationIds } },
      updateFields
    );

    // Emit real-time updates via Socket.io
    const io = req.app.get('io');
    if (io) {
      applications.forEach(application => {
        io.to(`student-${application.student}`).emit('application-updated', {
          applicationId: application._id,
          status,
          recruiterNotes
        });
      });
    }

    res.json({
      success: true,
      message: `${applications.length} applications updated successfully`
    });
  } catch (error) {
    console.error('Bulk update applications error:', error);
    res.status(500).json({ message: 'Server error during bulk update' });
  }
});

module.exports = router;
