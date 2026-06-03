const mongoose = require('mongoose');

const labSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  subject: { type: String, required: true, trim: true },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium',
  },
  duration: { type: Number, default: 60 }, // in minutes
  instructions: { type: [String], default: [] }, // step-by-step
  vmUrl: { type: String, default: '' },       // VMware web console URL
  vmUsername: { type: String, default: '' },  // VM login credentials
  vmPassword: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  // Track who has completed this lab
  completions: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      completedAt: { type: Date, default: Date.now },
      timeTaken: { type: Number, default: 0 }, // minutes
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('Lab', labSchema);