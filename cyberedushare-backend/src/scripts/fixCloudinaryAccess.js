// Run once: node src/scripts/fixCloudinaryAccess.js
// Makes all existing raw/PDF uploads publicly accessible
require('dotenv').config();
const cloudinary = require('../config/cloudinary');
const Content = require('../models/Content');
const mongoose = require('mongoose');

async function fixAccess() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Get all content with a cloudinaryPublicId
  const resources = await Content.find({
    cloudinaryPublicId: { $exists: true, $ne: null }
  }).select('title cloudinaryPublicId fileUrl');

  console.log(`Found ${resources.length} resources to fix`);

  let fixed = 0;
  let failed = 0;

  for (const resource of resources) {
    try {
      // Update access mode to public on Cloudinary
      await cloudinary.api.update(resource.cloudinaryPublicId, {
        resource_type: 'raw',
        access_mode: 'public',
      });
      console.log(`✓ Fixed: ${resource.title}`);
      fixed++;
    } catch (err) {
      // Try as image type if raw fails
      try {
        await cloudinary.api.update(resource.cloudinaryPublicId, {
          resource_type: 'image',
          access_mode: 'public',
        });
        console.log(`✓ Fixed (image): ${resource.title}`);
        fixed++;
      } catch (err2) {
        console.log(`✗ Failed: ${resource.title} — ${err2.message}`);
        failed++;
      }
    }
  }

  console.log(`\nDone. Fixed: ${fixed}, Failed: ${failed}`);
  process.exit(0);
}

fixAccess().catch(err => {
  console.error(err);
  process.exit(1);
});