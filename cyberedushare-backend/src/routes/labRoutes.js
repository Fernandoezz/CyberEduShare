const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getLabs,
  getLab,
  submitCompletion,
  createLab,
} = require('../controllers/labController');

router.use(protect);

router.get('/',               getLabs);
router.post('/create',        createLab);   // for seeding labs into DB
router.get('/:id',            getLab);
router.post('/:id/complete',  submitCompletion);

module.exports = router;