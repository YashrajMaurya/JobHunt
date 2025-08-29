const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Job is required']
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required']
  },
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recruiter is required']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  coverLetter: {
    type: String,
    maxlength: [1000, 'Cover letter cannot be more than 1000 characters']
  },
  resume: {
    public_id: String,
    url: String
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date
  },
  recruiterNotes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  interviewDate: {
    type: Date
  },
  interviewLocation: {
    type: String
  },
  interviewType: {
    type: String,
    enum: ['Online', 'In-person', 'Phone', 'Not scheduled']
  },
  // Tracking fields
  isViewed: {
    type: Boolean,
    default: false
  },
  isShortlisted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for better query performance
applicationSchema.index({ job: 1, student: 1 }, { unique: true });
applicationSchema.index({ student: 1, status: 1 });
applicationSchema.index({ recruiter: 1, status: 1 });
applicationSchema.index({ status: 1, createdAt: -1 });

// Prevent duplicate applications
applicationSchema.pre('save', async function(next) {
  if (this.isNew) {
    const existingApplication = await this.constructor.findOne({
      job: this.job,
      student: this.student
    });
    
    if (existingApplication) {
      return next(new Error('You have already applied for this job'));
    }
  }
  next();
});

// Update job application counts when application status changes
applicationSchema.post('save', async function(doc) {
  const Job = mongoose.model('Job');
  const job = await Job.findById(doc.job);
  
  if (job) {
    const counts = await mongoose.model('Application').aggregate([
      { $match: { job: doc.job } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const statusCounts = {};
    counts.forEach(item => {
      statusCounts[item._id] = item.count;
    });
    
    await Job.findByIdAndUpdate(doc.job, {
      totalApplications: (statusCounts.pending || 0) + (statusCounts.accepted || 0) + (statusCounts.rejected || 0),
      acceptedApplications: statusCounts.accepted || 0,
      rejectedApplications: statusCounts.rejected || 0
    });
  }
});

module.exports = mongoose.model('Application', applicationSchema);
