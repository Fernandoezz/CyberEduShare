const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

const {
  register,
  login,
  verifyOtp,
  resendOtp,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  getProfile,
  updateNotifications,
  deleteAccount,
  updateEnrolledCourses,
} = require('../controllers/authController');

// ── Public routes
router.post('/register',          register);
router.post('/login',             login);
router.post('/verify-otp',        verifyOtp);
router.post('/resend-otp',        resendOtp);
router.post('/forgot-password',   forgotPassword);
router.post('/verify-reset-otp',  verifyResetOtp);
router.post('/reset-password',    resetPassword);

// ── Protected routes (require JWT)
router.get('/profile',                    protect, getProfile);
router.put('/profile/notifications',      protect, updateNotifications);
router.delete('/profile/delete-account',  protect, deleteAccount);
router.put('/profile/courses',            protect, updateEnrolledCourses);

module.exports = router;