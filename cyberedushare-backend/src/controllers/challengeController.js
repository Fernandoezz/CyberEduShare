const Challenge = require('../models/Challenge');
const User = require('../models/User');
const Notification = require('../models/Notification');

// ── Dynamic points based on difficulty
const pointsMap = { Easy: 100, Medium: 250, Hard: 500 };

// ── GET ALL CHALLENGES (with filters)
exports.getChallenges = async (req, res) => {
  try {
    const { category, difficulty } = req.query;
    const filter = { isActive: true };
    if (category)   filter.category   = { $regex: category, $options: 'i' };
    if (difficulty) filter.difficulty = difficulty;

    const challenges = await Challenge.find(filter)
      .sort({ difficulty: 1, createdAt: -1 })
      .select('-flag -solves'); // never expose flag in list

    // Attach solve count + whether current user solved it
    const userId = req.user._id.toString();
    const result = challenges.map((c) => {
      const obj = c.toObject();
      obj.solveCount = c.solves ? c.solves.length : 0;
      return obj;
    });

    // Attach isSolved per challenge for this user
    const allChallenges = await Challenge.find(filter).select('solves');
    const solvedIds = allChallenges
      .filter((c) => c.solves.some((s) => s.user.toString() === userId))
      .map((c) => c._id.toString());

    const withSolved = result.map((c) => ({
      ...c,
      isSolved: solvedIds.includes(c._id.toString()),
    }));

    res.json(withSolved);
  } catch (error) {
    console.error('Get challenges error:', error);
    res.status(500).json({ message: 'Server error fetching challenges' });
  }
};

// ── GET SINGLE CHALLENGE
exports.getChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id).select('-flag');
    if (!challenge) return res.status(404).json({ message: 'Challenge not found' });

    const userId = req.user._id.toString();
    const solve  = challenge.solves.find((s) => s.user.toString() === userId);

    const obj = challenge.toObject();
    obj.isSolved     = !!solve;
    obj.pointsEarned = solve ? solve.pointsEarned : null;
    obj.solveCount   = challenge.solves.length;
    // Sanitize hints — don't expose text unless unlocked (handled client-side via unlock endpoint)
    obj.hints = obj.hints.map((h, i) => ({
      _id:     h._id,
      index:   i + 1,
      penalty: h.penalty,
    }));

    res.json(obj);
  } catch (error) {
    console.error('Get challenge error:', error);
    res.status(500).json({ message: 'Server error fetching challenge' });
  }
};

// ── SUBMIT FLAG
exports.submitFlag = async (req, res) => {
  try {
    const { flag } = req.body;
    if (!flag) return res.status(400).json({ message: 'Flag is required' });

    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ message: 'Challenge not found' });

    const userId = req.user._id.toString();

    // Already solved?
    const alreadySolved = challenge.solves.some(
      (s) => s.user.toString() === userId
    );
    if (alreadySolved) {
      return res.status(400).json({ message: 'You already solved this challenge!' });
    }

    // Check flag (case-insensitive trim)
    if (flag.trim().toLowerCase() !== challenge.flag.trim().toLowerCase()) {
      return res.status(400).json({ message: 'Incorrect flag. Try again!' });
    }

    // Calculate points (base - hint penalties)
    const basePoints = pointsMap[challenge.difficulty] || 250;
    // Count hints this user has unlocked (stored in separate unlock tracking - simplified: 0 for now)
    const pointsEarned = basePoints;

    challenge.solves.push({
      user:         req.user._id,
      username:     req.user.username,
      pointsEarned,
      solvedAt:     new Date(),
    });
    await challenge.save();

    res.json({
      message:     '🎉 Correct! Flag accepted!',
      pointsEarned,
      solveCount:  challenge.solves.length,
    });
  } catch (error) {
    console.error('Submit flag error:', error);
    res.status(500).json({ message: 'Server error submitting flag' });
  }
};

// ── UNLOCK HINT
exports.unlockHint = async (req, res) => {
  try {
    const { hintIndex } = req.body; // 0-based index
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ message: 'Challenge not found' });

    const hint = challenge.hints[hintIndex];
    if (!hint) return res.status(404).json({ message: 'Hint not found' });

    res.json({
      hintIndex,
      text:    hint.text,
      penalty: hint.penalty,
    });
  } catch (error) {
    console.error('Unlock hint error:', error);
    res.status(500).json({ message: 'Server error unlocking hint' });
  }
};

// ── LEADERBOARD
exports.getLeaderboard = async (req, res) => {
  try {
    const challenges = await Challenge.find({ isActive: true }).select('solves');

    // Aggregate points per user
    const scoreMap = {};
    challenges.forEach((c) => {
      c.solves.forEach((s) => {
        const uid = s.user.toString();
        if (!scoreMap[uid]) {
          scoreMap[uid] = { userId: uid, username: s.username, totalPoints: 0, solveCount: 0 };
        }
        scoreMap[uid].totalPoints += s.pointsEarned || 0;
        scoreMap[uid].solveCount  += 1;
      });
    });

    const leaderboard = Object.values(scoreMap)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 50) // top 50
      .map((entry, i) => ({ ...entry, rank: i + 1 }));

    res.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ message: 'Server error fetching leaderboard' });
  }
};

// ── CREATE CHALLENGE (for seeding)
exports.createChallenge = async (req, res) => {
  try {
    const {
      title, description, category, difficulty,
      flag, hints, fileUrl,
    } = req.body;

    if (!title || !category || !flag)
      return res.status(400).json({ message: 'Title, category and flag are required' });

    const points = pointsMap[difficulty] || 250;

    const challenge = await Challenge.create({
      title, description, category, difficulty,
      points, flag,
      hints: hints || [],
      fileUrl: fileUrl || '',
    });

    // Notify all users about new challenge
    try {
      const allUsers = await User.find({}).select('_id');
      const notifs = allUsers.map((u) => ({
        recipient: u._id,
        type:      'challenge_available',
        title:     'New CTF Challenge Available!',
        body:      `"${title}" — ${difficulty} (${points} pts) in ${category}`,
        refId:     challenge._id.toString(),
        refType:   'challenge',
      }));
      if (notifs.length > 0) await Notification.insertMany(notifs);
    } catch (e) { console.error('Challenge notification error:', e.message); }

    res.status(201).json(challenge);
  } catch (error) {
    console.error('Create challenge error:', error);
    res.status(500).json({ message: 'Server error creating challenge' });
  }
};