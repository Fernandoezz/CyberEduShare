const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ── Protect — verify JWT
exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
      return res.status(401).json({ message: 'Not authorized. No token provided.' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password -otp -otpExpiresAt');
    if (!user) return res.status(401).json({ message: 'User not found.' });

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized. Invalid token.' });
  }
};

// ── Restrict to specific roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${roles.join(' or ')}`,
      });
    }
    next();
  };
};

// ── Admin only
exports.adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ message: 'Admin access required.' });
  next();
};

// ── Faculty or Admin
exports.facultyOrAdmin = (req, res, next) => {
  if (!['faculty', 'admin'].includes(req.user.role))
    return res.status(403).json({ message: 'Faculty or Admin access required.' });
  next();
};

// ── Moderator or Admin
exports.moderatorOrAdmin = (req, res, next) => {
  if (!['moderator', 'admin'].includes(req.user.role))
    return res.status(403).json({ message: 'Moderator or Admin access required.' });
  next();
};