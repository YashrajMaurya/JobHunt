const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { adminProtect } = require('../middleware/adminAuth');

const router = express.Router();

// Helper to sign admin JWT
const signAdminToken = (payload) => {
  const secret = process.env.JWT_SECRET_ADMIN || process.env.JWT_SECRET || 'fallback-secret-admin';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
};

// Admin Login (static credentials)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin1234';

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const token = signAdminToken({ id: 'admin', email, role: 'admin' });

    res.cookie('admin_token', token, {
      httpOnly: true,     //prevent js to access cookie
      secure: process.env.NODE_ENV === 'production',  //Use secure cookie in production
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',  //CSRF Protection
      maxAge: 7 * 24 * 60 * 60 * 1000,  //Cookie Expiration time
    });

    return res.json({ success: true, admin: { email, role: 'admin' } });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin Logout
router.post('/logout', adminProtect, (req, res) => {
  res.clearCookie('admin_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    path: '/',
  });
  return res.json({ success: true });
});

// Admin Me
router.get('/me', adminProtect, (req, res) => {
  return res.json({ success: true, admin: req.admin });
});

// Dashboard stats
router.get('/stats', adminProtect, async (req, res) => {
  try {
    const [totalUsers, totalStudents, totalRecruiters, totalJobs, activeJobs, totalApplications] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'recruiter' }),
      Job.countDocuments(),
      Job.countDocuments({ isActive: true }),
      Application.countDocuments(),
    ]);

    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(10).select('-password');
    const recentJobs = await Job.find().sort({ createdAt: -1 }).limit(10);
    const recentApplications = await Application.find().sort({ createdAt: -1 }).limit(10).populate('student', 'name email').populate('job', 'title companyName');

    res.json({
      totals: { totalUsers, totalStudents, totalRecruiters, totalJobs, activeJobs, totalApplications },
      recent: { recentUsers, recentJobs, recentApplications }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Users list/search
router.get('/users', adminProtect, async (req, res) => {
  try {
    const { role, q, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (q) filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
      { phone: { $regex: q, $options: 'i' } },
    ];

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).select('-password'),
      User.countDocuments(filter)
    ]);

    res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle user active
router.patch('/users/:id/toggle', adminProtect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, user });
  } catch (error) {
    console.error('Admin toggle user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Jobs list/search
router.get('/jobs', adminProtect, async (req, res) => {
  try {
    const { active, q, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (active === 'true') filter.isActive = true;
    if (active === 'false') filter.isActive = false;
    if (q) filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { companyName: { $regex: q, $options: 'i' } },
    ];
    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Job.countDocuments(filter)
    ]);
    res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    console.error('Admin jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle job active
router.patch('/jobs/:id/toggle', adminProtect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    job.isActive = !job.isActive;
    await job.save();
    res.json({ success: true, job });
  } catch (error) {
    console.error('Admin toggle job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Applications list/search
router.get('/applications', adminProtect, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Application.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('student', 'name email phone field graduationYear')
        .populate('recruiter', 'name email phone companyName')
        .populate('job', 'title companyName field'),
      Application.countDocuments(filter)
    ]);
    res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    console.error('Admin applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update application status
router.patch('/applications/:id/status', adminProtect, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'accepted', 'rejected', 'withdrawn'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!application) return res.status(404).json({ message: 'Application not found' });
    const io = req.app.get('io');
    if (io) {
      io.to(String(application.student)).emit('application-updated', { applicationId: application._id, status });
      io.to(String(application.recruiter)).emit('application-updated', { applicationId: application._id, status });
    }
    res.json({ success: true, application });
  } catch (error) {
    console.error('Admin update application status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


