const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: { 
  type: String, 
  enum: ['student', 'faculty', 'moderator', 'admin'], 
  default: 'student' 
},
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String,
    default: null
  },
  otpExpiresAt: {
    type: Date,
    default: null
  },
  // ── Profile extras
  enrolledCourses: {
    type: [String],
    default: []
  },
  linkedAccounts: {
    lms: { type: Boolean, default: false },
    googleDrive: { type: Boolean, default: false }
  },
  // ── Notification preferences
  notificationPreferences: {
    emailNotifications: { type: Boolean, default: true },
    pushNotifications:  { type: Boolean, default: true },
    labAlerts:          { type: Boolean, default: false },
    newResourceAlerts:  { type: Boolean, default: true }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);