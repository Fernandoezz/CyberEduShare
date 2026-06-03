const Content = require("../models/Content");
const cloudinary = require("../config/cloudinary");
const User = require("../models/User");
const { notifyEnrolledUsers } = require("../services/notificationService");

// ── UPLOAD RESOURCE
exports.uploadResource = async (req, res) => {
  try {
    const { title, description, subject, difficulty, type, tags, notes } =
      req.body;

    if (!title || !subject) {
      return res
        .status(400)
        .json({ message: "Title and subject are required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "A file is required" });
    }

    const parsedTags = tags
      ? tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    console.log("Uploaded file object:", req.file);

    const content = await Content.create({
      title,
      description: description || notes || "",
      subject,
      difficulty: difficulty || "Medium",
      type: type || "PDF",
      tags: parsedTags,
      fileUrl: req.file.path || req.file.secure_url || req.file.url,
      cloudinaryPublicId: req.file.filename || req.file.public_id,
      cloudinaryResourceType: req.file.resource_type || "raw",
      uploadedBy: req.user._id,
      uploaderName: req.user.username,
    });

    await notifyEnrolledUsers({
      User,
      course: subject,
      excludeUserId: req.user._id,
      type: "resource_uploaded",
      title: "New resource in your course!",
      body: `${req.user.username} uploaded "${title}" in ${subject}`,
      refId: content._id.toString(),
      refType: "content",
    });

    res.status(201).json(content);
  } catch (error) {
    console.error("Upload resource error:", error);
    console.error("Upload resource error message:", error.message);
    console.error("Upload resource stack:", error.stack);
    res.status(500).json({ message: "Server error during upload" });
  }
};

// ── SEARCH RESOURCES
exports.searchResources = async (req, res) => {
  try {
    const { q, subject, difficulty, type, page = 1, limit = 20 } = req.query;

    const filter = {};

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
        { subject: { $regex: q, $options: "i" } },
      ];
    }

    if (subject) filter.subject = { $regex: subject, $options: "i" };
    if (difficulty) filter.difficulty = difficulty;
    if (type) filter.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [results, total] = await Promise.all([
      Content.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select("-ratings"),
      Content.countDocuments(filter),
    ]);

    res.json({
      results,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error("Search resources error:", error);
    res.status(500).json({ message: "Server error during search" });
  }
};

// ── GET MY UPLOADS
exports.getMyContent = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [content, total] = await Promise.all([
      Content.find({ uploadedBy: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select("-ratings"),
      Content.countDocuments({ uploadedBy: req.user._id }),
    ]);

    res.json({ content, total, page: parseInt(page) });
  } catch (error) {
    console.error("Get my content error:", error);
    res.status(500).json({ message: "Server error fetching your content" });
  }
};

// ── GET SINGLE RESOURCE
exports.getResource = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const related = await Content.find({
      subject: content.subject,
      _id: { $ne: content._id },
    })
      .limit(3)
      .select("title description");

    res.json({ content, related });
  } catch (error) {
    console.error("Get resource error:", error);
    res.status(500).json({ message: "Server error fetching resource" });
  }
};

// ── DELETE OWN RESOURCE
exports.deleteResource = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const isOwner = content.uploadedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this resource" });
    }

    if (content.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(content.cloudinaryPublicId, {
          resource_type: content.cloudinaryResourceType || "raw",
        });
      } catch (cloudErr) {
        console.error("Cloudinary delete warning:", cloudErr.message);
      }
    }

    await Content.findByIdAndDelete(req.params.id);
    res.json({ message: "Resource deleted successfully" });
  } catch (error) {
    console.error("Delete resource error:", error);
    res.status(500).json({ message: "Server error deleting resource" });
  }
};

// ── HELPER: build correct Cloudinary URL for viewing/downloading
function buildCloudinaryUrl(fileUrl, forDownload = false) {
  if (!fileUrl) return null;

  if (!fileUrl.includes("res.cloudinary.com")) {
    return fileUrl;
  }

  if (!forDownload) {
    return fileUrl;
  }

  if (fileUrl.includes("/raw/upload/")) {
    return fileUrl.replace("/raw/upload/", "/raw/upload/fl_attachment/");
  }

  if (fileUrl.includes("/image/upload/")) {
    return fileUrl.replace("/image/upload/", "/image/upload/fl_attachment/");
  }

  if (fileUrl.includes("/video/upload/")) {
    return fileUrl.replace("/video/upload/", "/video/upload/fl_attachment/");
  }

  return fileUrl;
}

// ── GET VIEW URL (Start button)
exports.getFileUrl = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id).select(
      "fileUrl title type",
    );

    if (!content) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const viewUrl = buildCloudinaryUrl(content.fileUrl, false, content.type);

    res.json({
      url: viewUrl,
      title: content.title,
    });
  } catch (error) {
    console.error("Get file URL error:", error);
    res.status(500).json({ message: "Server error generating file URL" });
  }
};

// ── GET DOWNLOAD URL (Save button)
exports.downloadResource = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id).select(
      "fileUrl title type",
    );

    if (!content) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const downloadUrl = buildCloudinaryUrl(content.fileUrl, true, content.type);

    res.json({
      url: downloadUrl,
      title: content.title,
    });
  } catch (error) {
    console.error("Download resource error:", error);
    res.status(500).json({ message: "Server error generating download URL" });
  }
};

// ── TOGGLE BOOKMARK
exports.toggleBookmark = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const userId = req.user._id;
    const isBookmarked = content.bookmarks.includes(userId);

    if (isBookmarked) content.bookmarks.pull(userId);
    else content.bookmarks.push(userId);

    await content.save();

    res.json({
      bookmarked: !isBookmarked,
      bookmarkCount: content.bookmarks.length,
    });
  } catch (error) {
    console.error("Toggle bookmark error:", error);
    res.status(500).json({ message: "Server error toggling bookmark" });
  }
};

// ── RATE RESOURCE
exports.rateResource = async (req, res) => {
  try {
    const { score } = req.body;

    if (!score || score < 1 || score > 5) {
      return res.status(400).json({ message: "Score must be between 1 and 5" });
    }

    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const userId = req.user._id;
    const existingRating = content.ratings.find(
      (r) => r.user.toString() === userId.toString(),
    );

    if (existingRating) existingRating.score = score;
    else content.ratings.push({ user: userId, score });

    await content.save();

    res.json({
      message: "Rating saved",
      averageRating: content.averageRating,
      totalRatings: content.ratings.length,
    });
  } catch (error) {
    console.error("Rate resource error:", error);
    res.status(500).json({ message: "Server error rating resource" });
  }
};

// ── GET BOOKMARKED RESOURCES
exports.getBookmarks = async (req, res) => {
  try {
    const bookmarks = await Content.find({ bookmarks: req.user._id }).select(
      "-ratings",
    );
    res.json(bookmarks);
  } catch (error) {
    console.error("Get bookmarks error:", error);
    res.status(500).json({ message: "Server error fetching bookmarks" });
  }
};
