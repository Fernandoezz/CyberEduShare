const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload  = require('../middleware/uploadMiddleware');

const {
  uploadResource,
  searchResources,
  getMyContent,
  getResource,
  deleteResource,
  getFileUrl,
  downloadResource,
  toggleBookmark,
  rateResource,
  getBookmarks,
} = require('../controllers/contentController');

router.use(protect);

router.post('/',             upload.single('file'), uploadResource);
router.get('/search',        searchResources);
router.get('/bookmarks',     getBookmarks);
router.get('/my',            getMyContent);


router.get('/:id/view',      getFileUrl);         // Start button
router.get('/:id/download',  downloadResource);   // Save button
router.post('/:id/bookmark', toggleBookmark);
router.post('/:id/rate',     rateResource);


router.get('/:id',           getResource);
router.delete('/:id',        deleteResource);

module.exports = router;