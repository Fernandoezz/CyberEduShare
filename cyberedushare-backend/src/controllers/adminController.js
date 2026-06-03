const User       = require('../models/User');
const Content    = require('../models/Content');
const Question   = require('../models/Question');
const Project    = require('../models/Project');
const Challenge  = require('../models/Challenge');
const Lab        = require('../models/Lab');
const Notification = require('../models/Notification');

// ── DASHBOARD STATS
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers, students, faculty, moderators,
      totalResources, pendingResources,
      totalQuestions, totalProjects,
      totalChallenges, totalLabs,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'faculty' }),
      User.countDocuments({ role: 'moderator' }),
      Content.countDocuments(),
      Content.countDocuments({ isVerified: false }),
      Question.countDocuments(),
      Project.countDocuments(),
      Challenge.countDocuments({ isActive: true }),
      Lab.countDocuments({ isActive: true }),
    ]);

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: weekAgo } });
    const newResourcesThisWeek = await Content.countDocuments({ createdAt: { $gte: weekAgo } });

    res.json({
      users:     { total: totalUsers, students, faculty, moderators, newThisWeek: newUsersThisWeek },
      content:   { total: totalResources, pending: pendingResources, newThisWeek: newResourcesThisWeek },
      community: { questions: totalQuestions, projects: totalProjects },
      platform:  { challenges: totalChallenges, labs: totalLabs },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
};

// ── GET ALL USERS
exports.getUsers = async (req, res) => {
  try {
    const { role, q, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (q) {
      filter.$or = [
        { username: { $regex: q, $options: 'i' } },
        { email:    { $regex: q, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password -otp -otpExpiresAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);

    res.json({ users, total, page: parseInt(page) });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

// ── GET SINGLE USER  [NEW — needed by AdminRoleAssignment]
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -otp -otpExpiresAt');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error fetching user' });
  }
};

// ── UPDATE USER ROLE
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['student', 'faculty', 'moderator', 'admin'];
    if (!validRoles.includes(role))
      return res.status(400).json({ message: 'Invalid role' });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password -otp -otpExpiresAt');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Role updated successfully', user });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ message: 'Server error updating role' });
  }
};

// ── DELETE USER
exports.deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ message: 'Cannot delete your own account' });

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error deleting user' });
  }
};

// ── GET PENDING CONTENT
exports.getPendingContent = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [content, total] = await Promise.all([
      Content.find({ isVerified: false, isFlagged: { $ne: true } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Content.countDocuments({ isVerified: false, isFlagged: { $ne: true } }),
    ]);

    res.json({ content, total });
  } catch (error) {
    console.error('Get pending content error:', error);
    res.status(500).json({ message: 'Server error fetching pending content' });
  }
};

// ── GET SINGLE CONTENT ITEM  [NEW — needed by ModeratorReview]
exports.getContentItem = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) return res.status(404).json({ message: 'Content not found' });
    res.json({ content });
  } catch (error) {
    console.error('Get content item error:', error);
    res.status(500).json({ message: 'Server error fetching content' });
  }
};

// ── APPROVE CONTENT
exports.approveContent = async (req, res) => {
  try {
    const updateData = { isVerified: true, isFlagged: false };
    if (req.body.notes) updateData.moderatorNotes = req.body.notes;

    const content = await Content.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!content) return res.status(404).json({ message: 'Content not found' });

    await Notification.create({
      recipient: content.uploadedBy,
      type:      'resource_uploaded',
      title:     'Your resource was approved!',
      body:      `"${content.title}" has been approved and is now visible to all students.`,
      refId:     content._id.toString(),
      refType:   'content',
    });

    res.json({ message: 'Content approved', content });
  } catch (error) {
    console.error('Approve content error:', error);
    res.status(500).json({ message: 'Server error approving content' });
  }
};

// ── REQUEST CHANGES  [NEW — needed by ModeratorReview]
exports.requestChanges = async (req, res) => {
  try {
    const { notes } = req.body;
    const content = await Content.findByIdAndUpdate(
      req.params.id,
      { moderatorNotes: notes || '' },
      { new: true }
    );
    if (!content) return res.status(404).json({ message: 'Content not found' });

    await Notification.create({
      recipient: content.uploadedBy,
      type:      'resource_uploaded',
      title:     'Changes requested for your resource',
      body:      `"${content.title}" needs revisions. Note: ${notes || 'Please review and resubmit.'}`,
      refId:     content._id.toString(),
      refType:   'content',
    });

    res.json({ message: 'Changes requested', content });
  } catch (error) {
    console.error('Request changes error:', error);
    res.status(500).json({ message: 'Server error requesting changes' });
  }
};

// ── SAVE MODERATOR NOTES  [NEW — needed by ModeratorReview]
exports.saveNotes = async (req, res) => {
  try {
    const { notes } = req.body;
    const content = await Content.findByIdAndUpdate(
      req.params.id,
      { moderatorNotes: notes || '' },
      { new: true }
    );
    if (!content) return res.status(404).json({ message: 'Content not found' });
    res.json({ message: 'Notes saved', content });
  } catch (error) {
    console.error('Save notes error:', error);
    res.status(500).json({ message: 'Server error saving notes' });
  }
};

// ── REJECT / DELETE CONTENT
exports.rejectContent = async (req, res) => {
  try {
    const content = await Content.findByIdAndDelete(req.params.id);
    if (!content) return res.status(404).json({ message: 'Content not found' });

    await Notification.create({
      recipient: content.uploadedBy,
      type:      'resource_uploaded',
      title:     'Your resource was rejected',
      body:      `"${content.title}" was removed. Reason: ${req.body.reason || req.body.notes || 'Does not meet guidelines'}`,
      refId:     null,
      refType:   'content',
    });

    res.json({ message: 'Content rejected and deleted' });
  } catch (error) {
    console.error('Reject content error:', error);
    res.status(500).json({ message: 'Server error rejecting content' });
  }
};

// ── GET ALL CONTENT
exports.getAllContent = async (req, res) => {
  try {
    const { q, subject, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (q) filter.title = { $regex: q, $options: 'i' };
    if (subject) filter.subject = { $regex: subject, $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [content, total] = await Promise.all([
      Content.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Content.countDocuments(filter),
    ]);

    res.json({ content, total });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ── GET FLAGGED CONTENT  [NEW — needed by ModeratorFlagged]
exports.getFlaggedContent = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [content, total] = await Promise.all([
      Content.find({ isFlagged: true })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Content.countDocuments({ isFlagged: true }),
    ]);

    res.json({ content, total });
  } catch (error) {
    console.error('Get flagged content error:', error);
    res.status(500).json({ message: 'Server error fetching flagged content' });
  }
};

// ── UNFLAG CONTENT  [NEW — needed by ModeratorFlagged]
exports.unflagContent = async (req, res) => {
  try {
    const content = await Content.findByIdAndUpdate(
      req.params.id,
      { isFlagged: false },
      { new: true }
    );
    if (!content) return res.status(404).json({ message: 'Content not found' });
    res.json({ message: 'Content unflagged', content });
  } catch (error) {
    console.error('Unflag content error:', error);
    res.status(500).json({ message: 'Server error unflagging content' });
  }
};

// ── GET MODERATION HISTORY  [NEW — needed by ModeratorHistory]
exports.getModerationHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // History = all verified content (approved) + we track the moderator who reviewed
    const [content, total] = await Promise.all([
      Content.find({ isVerified: true })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('title subject uploaderName isVerified moderatorNotes createdAt updatedAt'),
      Content.countDocuments({ isVerified: true }),
    ]);

    res.json({ content, total });
  } catch (error) {
    console.error('Get moderation history error:', error);
    res.status(500).json({ message: 'Server error fetching history' });
  }
};

// ── GET ACTIVITY LOGS  [NEW — needed by AdminLogs]
exports.getLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build logs from recent Notifications as an activity feed
    const [logs, total] = await Promise.all([
      Notification.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('recipient', 'username email role'),
      Notification.countDocuments(),
    ]);

    const formatted = logs.map((n) => ({
      _id:       n._id,
      action:    n.title,
      detail:    n.body,
      type:      n.type,
      user:      n.recipient,
      refId:     n.refId,
      refType:   n.refType,
      createdAt: n.createdAt,
    }));

    res.json({ logs: formatted, total, page: parseInt(page) });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ message: 'Server error fetching logs' });
  }
};

// ── GET INTEGRATIONS  [NEW — needed by AdminIntegrations]
exports.getIntegrations = async (req, res) => {
  try {
    // Stored as a simple settings object — for now return defaults
    // In production you'd store this in a Settings model
    res.json({
      lms: {
        moodle:  { connected: false, label: 'Moodle' },
        canvas:  { connected: false, label: 'Canvas' },
        blackboard: { connected: false, label: 'Blackboard' },
      },
      sso: {
        google:   { enabled: false, label: 'Google SSO' },
        microsoft:{ enabled: false, label: 'Microsoft SSO' },
        saml:     { enabled: false, label: 'SAML 2.0' },
      },
    });
  } catch (error) {
    console.error('Get integrations error:', error);
    res.status(500).json({ message: 'Server error fetching integrations' });
  }
};

// ── UPDATE LMS INTEGRATION  [NEW — needed by AdminIntegrations]
exports.updateLmsIntegration = async (req, res) => {
  try {
    const { provider } = req.params;
    const { connected } = req.body;
    // In a real app, persist to a Settings collection
    res.json({ message: `LMS integration for ${provider} updated`, provider, connected });
  } catch (error) {
    console.error('Update LMS integration error:', error);
    res.status(500).json({ message: 'Server error updating LMS integration' });
  }
};

// ── UPDATE SSO INTEGRATION  [NEW — needed by AdminIntegrations]
exports.updateSsoIntegration = async (req, res) => {
  try {
    const { provider } = req.params;
    const { enabled } = req.body;
    res.json({ message: `SSO integration for ${provider} updated`, provider, enabled });
  } catch (error) {
    console.error('Update SSO integration error:', error);
    res.status(500).json({ message: 'Server error updating SSO integration' });
  }
};

// ── GET SYSTEM SETTINGS  [NEW — needed by AdminSystemSettings]
exports.getSettings = async (req, res) => {
  try {
    res.json({
      platformName:        'CyberEduShare',
      maintenanceMode:     false,
      registrationEnabled: true,
      maxUploadSizeMb:     50,
      allowedFileTypes:    ['PDF', 'Video', 'ZIP', 'Image', 'Other'],
      contentAutoApprove:  false,
      maxLoginAttempts:    5,
      sessionTimeoutHours: 168,
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Server error fetching settings' });
  }
};

// ── UPDATE SYSTEM SETTINGS  [NEW — needed by AdminSystemSettings]
exports.updateSettings = async (req, res) => {
  try {
    // In production, persist to a Settings model
    res.json({ message: 'Settings updated successfully', settings: req.body });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Server error updating settings' });
  }
};

// ── GET ALL QUESTIONS
exports.getAllQuestions = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [questions, total] = await Promise.all([
      Question.find().sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).select('-answers'),
      Question.countDocuments(),
    ]);
    res.json({ questions, total });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ── DELETE QUESTION
exports.deleteQuestion = async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: 'Question deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ── GET ALL PROJECTS
exports.getAllProjects = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [projects, total] = await Promise.all([
      Project.find().sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Project.countDocuments(),
    ]);
    res.json({ projects, total });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ── DELETE PROJECT
exports.deleteProject = async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ── SEND BROADCAST NOTIFICATION
exports.sendBroadcastNotification = async (req, res) => {
  try {
    const { title, body } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    const users = await User.find({}).select('_id');
    const notifications = users.map((u) => ({
      recipient: u._id,
      type:      'challenge_available',
      title,
      body:      body || '',
    }));

    await Notification.insertMany(notifications);
    res.json({ message: `Notification sent to ${users.length} users` });
  } catch (error) {
    console.error('Broadcast notification error:', error);
    res.status(500).json({ message: 'Server error sending notification' });
  }
};