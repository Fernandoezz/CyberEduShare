const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: [
      'answer_received',
      'resource_uploaded',
      'challenge_available',
      'project_liked',
      'project_commented',
      'lab_reminder',
    ],
    required: true,
  },
  title:    { type: String, required: true },
  body:     { type: String, default: '' },
  isRead:   { type: Boolean, default: false },
  // Optional reference to the related document
  refId:    { type: String, default: null }, // e.g. questionId, resourceId
  refType:  { type: String, default: null }, // e.g. 'question', 'content'
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);