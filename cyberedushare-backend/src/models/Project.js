const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  body: { type: String, required: true },
  commentedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  commentedByName: { type: String, default: '' },
}, { timestamps: true });

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  subject: { type: String, required: true, trim: true },
  techStack: { type: [String], default: [] },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  submittedByName: { type: String, default: '' },
  fileUrl: { type: String, default: null },
  cloudinaryPublicId: { type: String, default: null },
  likes: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
  comments: [commentSchema],
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);