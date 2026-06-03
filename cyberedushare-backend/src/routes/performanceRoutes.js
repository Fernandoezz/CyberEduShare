const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getPerformance,
  getLearningPath,
} = require('../controllers/performanceController');

router.use(protect);

router.get('/',             getPerformance);
router.get('/learning-path', getLearningPath);

module.exports = router;