const Project = require('../models/Project');
const { createNotification } = require('../services/notificationService');
const cloudinary = require('../config/cloudinary');

// ── SUBMIT PROJECT
exports.submitProject = async (req, res) => {
  try {
    const { title, description, subject, techStack } = req.body;

    if (!title || !subject) {
      return res.status(400).json({ message: 'Title and subject are required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Project ZIP file is required' });
    }

    const parsedTechStack = Array.isArray(techStack)
      ? techStack.map((t) => String(t).trim()).filter(Boolean)
      : typeof techStack === 'string'
        ? techStack.split(',').map((t) => t.trim()).filter(Boolean)
        : [];

    const project = await Project.create({
      title: title.trim(),
      description: description?.trim() || '',
      subject: subject.trim(),
      techStack: parsedTechStack,
      submittedBy: req.user._id,
      submittedByName: req.user.username,
      fileUrl: req.file.path || null,
      cloudinaryPublicId: req.file.filename || null,
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Submit project error:', error);
    res.status(500).json({
      message: error.message || 'Server error submitting project',
    });
  }
};

// ── GET ALL PROJECTS (search + filter)
exports.getProjects = async (req, res) => {
  try {
    const { q, subject, tech, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { techStack: { $regex: q, $options: 'i' } },
      ];
    }
    if (subject) filter.subject = { $regex: subject, $options: 'i' };
    if (tech) filter.techStack = { $regex: tech, $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-comments'),
      Project.countDocuments(filter),
    ]);

    res.json({ projects, total, page: parseInt(page) });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error fetching projects' });
  }
};

// ── GET SINGLE PROJECT
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project)
      return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Server error fetching project' });
  }
};

// ── TOGGLE LIKE
exports.toggleLike = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project)
      return res.status(404).json({ message: 'Project not found' });

    const userId = req.user._id;
    const hasLiked = project.likes.includes(userId);

    if (hasLiked) {
      project.likes.pull(userId);
    } else {
      project.likes.push(userId);
    }

    await project.save();
    res.json({ liked: !hasLiked, likeCount: project.likes.length });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ message: 'Server error toggling like' });
  }
};

// ── POST COMMENT
exports.postComment = async (req, res) => {
  try {
    const { body } = req.body;
    if (!body)
      return res.status(400).json({ message: 'Comment body is required' });

    const project = await Project.findById(req.params.id);
    if (!project)
      return res.status(404).json({ message: 'Project not found' });

    project.comments.push({
      body,
      commentedBy: req.user._id,
      commentedByName: req.user.username,
    });

    await project.save();
    res.status(201).json(project);
  } catch (error) {
    console.error('Post comment error:', error);
    res.status(500).json({ message: 'Server error posting comment' });
  }
};