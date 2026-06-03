const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { updateNotifications, deleteAccount } = require('../controllers/authController');
 
router.use(protect);
 
// Aliases expected by AdminSettings.tsx and ModeratorSettings.tsx
router.put('/notification-preferences', updateNotifications);
router.delete('/me',                    deleteAccount);
 
module.exports = router;