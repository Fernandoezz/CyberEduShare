const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  submitProject,
  getProjects,
  getProject,
  toggleLike,
  postComment,
} = require('../controllers/projectController');

router.use(protect);

router.post('/', upload.single('projectFile'), submitProject);
router.get('/',               getProjects);
router.get('/:id',            getProject);
router.post('/:id/like',      toggleLike);
router.post('/:id/comments',  postComment);

module.exports = router;