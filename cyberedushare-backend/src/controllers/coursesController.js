const User = require('../models/User');

// ── GET MY ENROLLED / ASSIGNED COURSES  [needed by FacultyCourses]
// Faculty "courses" are stored as enrolledCourses strings on the User model.
exports.getMyCourses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('enrolledCourses');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Return as an array of course objects for the frontend
    const courses = (user.enrolledCourses || []).map((name, idx) => ({
      _id:  `course_${idx}_${Buffer.from(name).toString('hex').slice(0, 8)}`,
      name,
    }));

    res.json({ courses, total: courses.length });
  } catch (error) {
    console.error('Get my courses error:', error);
    res.status(500).json({ message: 'Server error fetching courses' });
  }
};

// ── ADD A COURSE  [needed by FacultyCourses]
exports.addCourse = async (req, res) => {
  try {
    const { code, title, description } = req.body;

    if (!code || !code.trim())
      return res.status(400).json({ message: 'Course code is required' });
    if (!title || !title.trim())
      return res.status(400).json({ message: 'Course title is required' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Store as "CODE: Title" or adapt to your Course model
    const courseName = `${code.trim()}: ${title.trim()}`;
    if (user.enrolledCourses.includes(courseName))
      return res.status(409).json({ message: 'Course already added' });

    user.enrolledCourses.push(courseName);
    await user.save();

    res.status(201).json({
      message: 'Course added successfully',
      enrolledCourses: user.enrolledCourses,
    });
  } catch (error) {
    console.error('Add course error:', error);
    res.status(500).json({ message: 'Server error adding course' });
  }
};