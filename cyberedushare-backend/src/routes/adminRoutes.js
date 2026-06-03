const express = require('express');
const router  = express.Router();
const { protect, adminOnly, moderatorOrAdmin } = require('../middleware/authMiddleware');
const {
  getDashboardStats,
  getUsers, getUser, updateUserRole, deleteUser,
  getPendingContent, getContentItem, approveContent, requestChanges, saveNotes, rejectContent, getAllContent,
  getFlaggedContent, unflagContent, getModerationHistory,
  getAllQuestions, deleteQuestion,
  getAllProjects, deleteProject,
  sendBroadcastNotification,
  getLogs,
  getIntegrations, updateLmsIntegration, updateSsoIntegration,
  getSettings, updateSettings,
} = require('../controllers/adminController');

router.use(protect);

// ── Admin only
router.get('/stats',                       adminOnly, getDashboardStats);
router.get('/users',                       adminOnly, getUsers);
router.get('/users/:id',                   adminOnly, getUser);               // NEW
router.put('/users/:id/role',              adminOnly, updateUserRole);
router.delete('/users/:id',               adminOnly, deleteUser);
router.post('/notifications/broadcast',    adminOnly, sendBroadcastNotification);
router.get('/logs',                        adminOnly, getLogs);                // NEW
router.get('/integrations',                adminOnly, getIntegrations);        // NEW
router.put('/integrations/lms/:provider',  adminOnly, updateLmsIntegration);  // NEW
router.put('/integrations/sso/:provider',  adminOnly, updateSsoIntegration);  // NEW
router.get('/settings',                    adminOnly, getSettings);            // NEW
router.put('/settings',                    adminOnly, updateSettings);         // NEW

// ── Moderator or Admin
router.get('/content/pending',              moderatorOrAdmin, getPendingContent);
router.get('/content/flagged',              moderatorOrAdmin, getFlaggedContent);    // NEW
router.get('/content/history',              moderatorOrAdmin, getModerationHistory); // NEW
router.get('/content/:id',                  moderatorOrAdmin, getContentItem);       // NEW
router.put('/content/:id/approve',          moderatorOrAdmin, approveContent);
router.put('/content/:id/request-changes',  moderatorOrAdmin, requestChanges);      // NEW
router.put('/content/:id/notes',            moderatorOrAdmin, saveNotes);            // NEW
router.put('/content/:id/unflag',           moderatorOrAdmin, unflagContent);        // NEW
router.delete('/content/:id',              moderatorOrAdmin, rejectContent);
router.get('/content',                      moderatorOrAdmin, getAllContent);
router.get('/questions',                    moderatorOrAdmin, getAllQuestions);
router.delete('/questions/:id',            moderatorOrAdmin, deleteQuestion);
router.get('/projects',                     moderatorOrAdmin, getAllProjects);
router.delete('/projects/:id',             moderatorOrAdmin, deleteProject);

module.exports = router;