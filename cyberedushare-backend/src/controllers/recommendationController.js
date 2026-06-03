const axios  = require('axios');
const User    = require('../models/User');
const Content = require('../models/Content');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's enrolled courses and bookmarks
    const user = await User.findById(userId).select('enrolledCourses');
    const enrolledCourses = user.enrolledCourses || [];

    // Get bookmarked resource IDs (to exclude from recommendations)
    const bookmarkedResources = await Content.find(
      { bookmarks: userId },
      { _id: 1 }
    );
    const bookmarkedIds = bookmarkedResources.map((r) => r._id.toString());

    // Get subjects from resources the user uploaded (proxy for viewed)
    const uploadedResources = await Content.find(
      { uploadedBy: userId },
      { subject: 1 }
    );
    const viewedSubjects = [...new Set(uploadedResources.map((r) => r.subject))];

    // Call Python AI microservice
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/recommendations`, {
      enrolledCourses,
      bookmarkedIds,
      viewedSubjects,
      limit: 6,
    }, { timeout: 10000 });

    res.json(aiResponse.data);
  } catch (error) {
    console.error('Recommendation error:', error.message);

    // Fallback: return latest verified resources if AI service is down
    const fallback = await Content.find({ isVerified: true })
      .sort({ createdAt: -1 })
      .limit(6)
      .select('title description subject difficulty type uploaderName fileUrl');

    res.json({
      recommendations: fallback.map((r) => ({
        id:           r._id,
        title:        r.title,
        description:  r.description,
        subject:      r.subject,
        difficulty:   r.difficulty,
        type:         r.type,
        uploaderName: r.uploaderName,
        fileUrl:      r.fileUrl,
        averageRating: 0,
        score:        0,
      })),
      fallback: true,
    });
  }
};