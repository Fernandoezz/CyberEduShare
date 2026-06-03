const Notification = require('../models/Notification');

// ── Create a single notification
exports.createNotification = async ({
  recipient,
  type,
  title,
  body = '',
  refId = null,
  refType = null,
}) => {
  try {
    await Notification.create({ recipient, type, title, body, refId, refType });
  } catch (err) {
    console.error('Create notification error:', err.message);
  }
};

// ── Notify all users enrolled in a specific course
exports.notifyEnrolledUsers = async ({
  User,
  course,
  excludeUserId,
  type,
  title,
  body,
  refId,
  refType,
}) => {
  try {
    // Match if enrolled course contains the subject OR subject contains the enrolled course
    const allUsers = await User.find({ _id: { $ne: excludeUserId } }).select('enrolledCourses _id');
    const matchedUserIds = allUsers
      .filter(u => u.enrolledCourses.some(ec =>
        ec.toLowerCase().includes(course.toLowerCase()) ||
        course.toLowerCase().includes(ec.toLowerCase())
      ))
      .map(u => u._id);

    const users = matchedUserIds.length > 0
      ? await User.find({ _id: { $in: matchedUserIds } }).select('_id')
      : [];

    const notifications = users.map((u) => ({
      recipient: u._id,
      type,
      title,
      body,
      refId:   refId   || null,
      refType: refType || null,
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (err) {
    console.error('Notify enrolled users error:', err.message);
  }
};