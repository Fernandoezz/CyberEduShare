const User       = require('../models/User');
const Content    = require('../models/Content');
const Question   = require('../models/Question');
const Project    = require('../models/Project');
const Challenge  = require('../models/Challenge');
const Lab        = require('../models/Lab');

// ── GET PERFORMANCE STATS
exports.getPerformance = async (req, res) => {
  try {
    const userId = req.user._id;

    // Resources bookmarked (proxy for viewed)
    const bookmarkedResources = await Content.countDocuments({
      bookmarks: userId,
    });

    // Resources uploaded
    const resourcesUploaded = await Content.countDocuments({
      uploadedBy: userId,
    });

    // Questions asked
    const questionsAsked = await Question.countDocuments({
      askedBy: userId,
    });

    // Answers given
    const questionsWithAnswers = await Question.find({
      'answers.answeredBy': userId,
    });
    const answersGiven = questionsWithAnswers.reduce((count, q) => {
      return count + q.answers.filter(
        (a) => a.answeredBy.toString() === userId.toString()
      ).length;
    }, 0);

    // Projects submitted
    const projectsSubmitted = await Project.countDocuments({
      submittedBy: userId,
    });

    // Labs completed
    const labsCompleted = await Lab.countDocuments({
      'completions.user': userId,
    });

    // CTF stats
    const allChallenges = await Challenge.find({ isActive: true });
    let challengesSolved = 0;
    let ctfScore = 0;
    allChallenges.forEach((c) => {
      const solve = c.solves.find(
        (s) => s.user.toString() === userId.toString()
      );
      if (solve) {
        challengesSolved++;
        ctfScore += solve.pointsEarned || 0;
      }
    });

    // CTF rank
    const scoreMap = {};
    allChallenges.forEach((c) => {
      c.solves.forEach((s) => {
        const uid = s.user.toString();
        if (!scoreMap[uid]) scoreMap[uid] = 0;
        scoreMap[uid] += s.pointsEarned || 0;
      });
    });
    const sortedScores = Object.values(scoreMap).sort((a, b) => b - a);
    const ctfRank = sortedScores.indexOf(ctfScore) + 1 || null;

    // Enrolled courses from user profile
    const user = await User.findById(userId).select('enrolledCourses username');

    res.json({
      username:          user.username,
      enrolledCourses:   user.enrolledCourses || [],
      stats: {
        resourcesBookmarked: bookmarkedResources,
        resourcesUploaded,
        questionsAsked,
        answersGiven,
        projectsSubmitted,
        labsCompleted,
        challengesSolved,
        ctfScore,
        ctfRank,
      },
    });
  } catch (error) {
    console.error('Get performance error:', error);
    res.status(500).json({ message: 'Server error fetching performance' });
  }
};

// ── GET AI LEARNING PATH
exports.getLearningPath = async (req, res) => {
  try {
    const userId = req.user._id;
    const user   = await User.findById(userId).select('enrolledCourses username');

    const enrolledCourses = user.enrolledCourses || [];

    if (enrolledCourses.length === 0) {
      return res.json({
        learningPath: [],
        message: 'Enroll in courses to get a personalized learning path.',
      });
    }

    // Get stats to understand weak areas
    const questionsAsked = await Question.countDocuments({ askedBy: userId });
    const labsCompleted  = await Lab.countDocuments({ 'completions.user': userId });
    const allChallenges  = await Challenge.find({ isActive: true });
    let challengesSolved = 0;
    allChallenges.forEach((c) => {
      if (c.solves.some((s) => s.user.toString() === userId.toString()))
        challengesSolved++;
    });

    // Build learning path steps based on enrolled courses
    // Each course gets a structured path: Resources → Labs → Q&A → Challenges
    const learningPath = enrolledCourses.map((course, index) => ({
      step:        index + 1,
      course,
      title:       `Master ${course}`,
      description: `Complete the recommended activities for ${course} to build strong foundations.`,
      tasks: [
        {
          type:        'resource',
          label:       'Study Resources',
          description: `Search and bookmark at least 3 resources tagged with ${course}`,
          icon:        'book',
          completed:   false,
        },
        {
          type:        'lab',
          label:       'Complete a Lab',
          description: `Launch and complete a Virtual Lab related to ${course}`,
          icon:        'laptop',
          completed:   labsCompleted > 0,
        },
        {
          type:        'qa',
          label:       'Engage in Q&A',
          description: `Ask or answer at least one question about ${course}`,
          icon:        'chat',
          completed:   questionsAsked > 0,
        },
        {
          type:        'challenge',
          label:       'Solve a CTF Challenge',
          description: `Find and solve a CTF challenge related to ${course}`,
          icon:        'flag',
          completed:   challengesSolved > 0,
        },
      ],
    }));

    res.json({ learningPath });
  } catch (error) {
    console.error('Learning path error:', error);
    res.status(500).json({ message: 'Server error generating learning path' });
  }
};