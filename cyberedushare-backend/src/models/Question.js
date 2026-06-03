const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  body: { type: String, required: true },
  answeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answeredByName: { type: String, default: '' },
  upvotes: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
  isAccepted: { type: Boolean, default: false },
}, { timestamps: true });

const questionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  body: { type: String, default: '' },
  subject: { type: String, required: true, trim: true },
  tags: { type: [String], default: [] },
  askedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  askedByName: { type: String, default: '' },
  upvotes: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
  answers: [answerSchema],
  isSolved: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);