const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  postQuestion,
  getQuestions,
  getQuestion,
  upvoteQuestion,
  postAnswer,
  upvoteAnswer,
  acceptAnswer,
} = require('../controllers/questionController');

router.use(protect);

router.post('/',                              postQuestion);
router.get('/',                               getQuestions);
router.get('/:id',                            getQuestion);
router.post('/:id/upvote',                    upvoteQuestion);
router.post('/:id/answers',                   postAnswer);
router.post('/:id/answers/:answerId/upvote',  upvoteAnswer);
router.post('/:id/answers/:answerId/accept',  acceptAnswer);

module.exports = router;