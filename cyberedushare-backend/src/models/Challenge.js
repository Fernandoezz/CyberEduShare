const mongoose = require('mongoose');

const hintSchema = new mongoose.Schema({
  text: { type: String, required: true },
  penalty: { type: Number, default: 10 }, // points deducted for using hint
});

const solveSchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  username:   { type: String },
  pointsEarned: { type: Number },
  hintsUsed:  { type: Number, default: 0 },
  solvedAt:   { type: Date, default: Date.now },
});

const challengeSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category:    { type: String, required: true, trim: true }, // e.g. Web, Crypto, Forensics, Reverse, Pwn, OSINT
  difficulty:  { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  points: {
    type: Number,
    default: function () {
      if (this.difficulty === 'Easy')   return 100;
      if (this.difficulty === 'Hard')   return 500;
      return 250;
    },
  },
  flag:        { type: String, required: true }, // e.g. FLAG{some_secret}
  hints:       [hintSchema],
  solves:      [solveSchema],
  isActive:    { type: Boolean, default: true },
  fileUrl:     { type: String, default: '' }, // optional challenge file
}, { timestamps: true });

module.exports = mongoose.model('Challenge', challengeSchema);