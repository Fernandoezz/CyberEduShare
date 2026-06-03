const express = require('express');
const router  = express.Router();
const { protect, facultyOrAdmin } = require('../middleware/authMiddleware');
const { getMyCourses, addCourse } = require('../controllers/coursesController');

router.use(protect);

router.get('/my',  facultyOrAdmin, getMyCourses);  // GET /api/courses/my
router.post('/',   facultyOrAdmin, addCourse);     // POST /api/courses

module.exports = router;