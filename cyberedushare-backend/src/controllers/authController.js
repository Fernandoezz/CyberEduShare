const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendOtpEmail } = require('../services/emailService');

const generateOtp = () =>
  Math.floor(1000 + Math.random() * 9000).toString();

// ── REGISTER
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ message: 'All fields are required' });

    const validRoles = ['student', 'faculty', 'moderator'];
    const assignedRole = validRoles.includes(role) ? role : 'student';

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(409).json({ message: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.create({
      username, email, password: hashedPassword, otp, otpExpiresAt, role: assignedRole,
    });

    await sendOtpEmail(email, otp);

    res.status(201).json({
      message: 'Registration successful. Check your email for the OTP.',
      email: user.email,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// ── VERIFY OTP (registration)
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: 'Email and OTP are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'Email already verified' });
    if (!user.otp || user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (new Date() > user.otpExpiresAt)
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });

    user.isVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.otp;
    delete userResponse.otpExpiresAt;

    res.json({ message: 'Email verified successfully', token, user: userResponse });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error during verification' });
  }
};

// ── RESEND OTP (registration)
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'Email already verified' });

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOtpEmail(email, otp);
    res.json({ message: 'A new OTP has been sent to your email.' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Server error during OTP resend' });
  }
};

// ── LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });
    if (!user.isVerified)
      return res.status(403).json({ message: 'Please verify your email before logging in.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.otp;
    delete userResponse.otpExpiresAt;

    res.json({ token, user: userResponse });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// ── FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({
        message: 'If that email is registered, an OTP has been sent.',
        email,
      });
    }

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    await sendOtpEmail(email, otp);

    res.status(200).json({
      message: 'If that email is registered, an OTP has been sent.',
      email,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during forgot password' });
  }
};

// ── VERIFY RESET OTP
exports.verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: 'Email and OTP are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });
    if (!user.otp || user.otp !== otp)
      return res.status(400).json({ message: 'Invalid OTP' });
    if (new Date() > user.otpExpiresAt)
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });

    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    res.json({ message: 'OTP verified. You may now reset your password.', email });
  } catch (error) {
    console.error('Verify reset OTP error:', error);
    res.status(500).json({ message: 'Server error during OTP verification' });
  }
};

// ── RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword)
      return res.status(400).json({ message: 'Email and new password are required' });
    if (newPassword.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};

// ── GET PROFILE (protected)
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -otp -otpExpiresAt');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

// ── UPDATE NOTIFICATION PREFERENCES (protected)
exports.updateNotifications = async (req, res) => {
  try {
    const { emailNotifications, pushNotifications, labAlerts, newResourceAlerts } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.notificationPreferences = {
      emailNotifications: emailNotifications ?? user.notificationPreferences.emailNotifications,
      pushNotifications:  pushNotifications  ?? user.notificationPreferences.pushNotifications,
      labAlerts:          labAlerts          ?? user.notificationPreferences.labAlerts,
      newResourceAlerts:  newResourceAlerts  ?? user.notificationPreferences.newResourceAlerts,
    };

    await user.save();
    res.json({
      message: 'Notification preferences updated.',
      notificationPreferences: user.notificationPreferences,
    });
  } catch (error) {
    console.error('Update notifications error:', error);
    res.status(500).json({ message: 'Server error updating preferences' });
  }
};

// ── DELETE ACCOUNT (protected)
exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await User.findByIdAndDelete(req.user._id);
    res.json({ message: 'Account deleted successfully.' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Server error deleting account' });
  }
};

// ── UPDATE ENROLLED COURSES (protected)
exports.updateEnrolledCourses = async (req, res) => {
  try {
    const { enrolledCourses } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.enrolledCourses = enrolledCourses || [];
    await user.save();

    res.json({
      message: 'Enrolled courses updated successfully',
      enrolledCourses: user.enrolledCourses,
    });
  } catch (error) {
    console.error('Update enrolled courses error:', error);
    res.status(500).json({ message: 'Server error updating enrolled courses' });
  }
};