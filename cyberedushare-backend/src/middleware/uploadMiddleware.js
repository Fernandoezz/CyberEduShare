const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: 'cyberedushare/resources',
      resource_type: 'auto',
      type: 'upload',
      public_id: `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`,
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/zip',
      'application/x-zip-compressed',
      'multipart/x-zip',
      'video/mp4',
      'video/mpeg',
      'image/jpeg',
      'image/png',
      'image/gif',
    ];

    const isZipByName = file.originalname.toLowerCase().endsWith('.zip');

    if (allowed.includes(file.mimetype) || isZipByName) {
      cb(null, true);
    } else {
      cb(new Error('File type not supported. Allowed: PDF, ZIP, MP4, JPEG, PNG, GIF'));
    }
  },
});

module.exports = upload;