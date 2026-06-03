const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getRecommendations } = require('../controllers/recommendationController');

router.use(protect);
router.get('/', getRecommendations);

module.exports = router;