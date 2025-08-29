const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a job title'],
    trim: true,
    maxlength: [100, 'Job title cannot be more than 100 characters']
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Company is required']
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required']
  },
  description: {
    type: String,
    required: [true, 'Please provide a job description'],
    maxlength: [2000, 'Job description cannot be more than 2000 characters']
  },
  requirements: {
    type: String,
    required: [true, 'Please provide job requirements'],
    maxlength: [1000, 'Requirements cannot be more than 1000 characters']
  },
  field: {
    type: String,
    enum: ['Mechanical Engineering', 'Computer Science', 'BCA', 'B.Com', 'Electrical Engineering', 'Civil Engineering', 'Other'],
    required: [true, 'Please specify the field']
  },
  location: {
    type: String,
    required: [true, 'Please provide job location'],
    trim: true
  },
  type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Internship', 'Contract'],
    required: [true, 'Please specify job type']
  },
  experience: {
    type: String,
    enum: ['Entry Level', '1-2 years', '3-5 years', '5+ years'],
    required: [true, 'Please specify experience level']
  },
  salary: {
    min: {
      type: Number,
      required: [true, 'Please provide minimum salary']
    },
    max: {
      type: Number,
      required: [true, 'Please provide maximum salary']
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  skills: [{
    type: String,
    trim: true
  }],
  benefits: [{
    type: String,
    trim: true
  }],
  applicationDeadline: {
    type: Date,
    required: [true, 'Please provide application deadline']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  totalApplications: {
    type: Number,
    default: 0
  },
  acceptedApplications: {
    type: Number,
    default: 0
  },
  rejectedApplications: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better search performance
jobSchema.index({ field: 1, isActive: 1, createdAt: -1 });
jobSchema.index({ company: 1, isActive: 1 });

// Virtual for days until deadline
jobSchema.virtual('daysUntilDeadline').get(function() {
  const now = new Date();
  const deadline = new Date(this.applicationDeadline);
  const diffTime = deadline - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Ensure virtual fields are serialized
jobSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Job', jobSchema);
