const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'recruiter'],
    required: [true, 'Please specify user role']
  },
  phone: {
    type: String,
    required: [function() { return this.isNew; }, 'Please provide a phone number'],
    match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
  },
  profilePicture: {
    public_id: String,
    url: {
      type: String,
      default: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
    }
  },
  resume: {
    public_id: String,
    url: String,
    viewUrl: String
  },
  // Student specific fields
  field: {
    type: String,
    enum: ['Mechanical Engineering', 'Computer Science', 'BCA', 'B.Com', 'Electrical Engineering', 'Civil Engineering', 'Other'],
    required: function() { return this.role === 'student'; }
  },
  graduationYear: {
    type: Number,
    min: [2020, 'Graduation year must be 2020 or later'],
    max: [2030, 'Graduation year cannot be more than 2030'],
    required: function() { return this.role === 'student'; }
  },
  // Recruiter specific fields
  companyName: {
    type: String,
    required: function() { return this.role === 'recruiter'; }
  },
  companyDescription: {
    type: String,
    maxlength: [500, 'Company description cannot be more than 500 characters']
  },
  companyLogo: {
    public_id: String,
    url: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive fields when converting to JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
