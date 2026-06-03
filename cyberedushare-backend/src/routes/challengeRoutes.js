const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getChallenges,
  getChallenge,
  submitFlag,
  unlockHint,
  getLeaderboard,
  createChallenge,
} = require('../controllers/challengeController');

router.use(protect);

router.get('/',                     getChallenges);
router.get('/leaderboard',          getLeaderboard);
router.post('/create',              createChallenge);
router.get('/:id',                  getChallenge);
router.post('/:id/submit',          submitFlag);
router.post('/:id/hint',            unlockHint);

module.exports = router;