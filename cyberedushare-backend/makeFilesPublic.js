// Run once from your backend folder:
// node src/scripts/makeFilesPublic.js

require('dotenv').config();
const mongoose   = require('mongoose');
const cloudinary = require('./src/config/cloudinary');
const Content    = require('./src/models/Content');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const resources = await Content.find({
    cloudinaryPublicId: { $exists: true, $ne: null },
  }).select('title cloudinaryPublicId fileUrl');

  console.log(`Found ${resources.length} resources to fix\n`);

  for (const r of resources) {
    // Try raw first, then image
    for (const resType of ['raw', 'image', 'video']) {
      try {
        await cloudinary.api.update(r.cloudinaryPublicId, {
          resource_type: resType,
          access_mode:   'public',
        });
        console.log(`✓ [${resType}] ${r.title}`);
        break;
      } catch (e) {
        if (!e.message?.includes('not found')) {
          // unexpected error
          console.log(`  skipping ${resType}: ${e.message}`);
        }
      }
    }
  }

  console.log('\nDone. Restart your backend and try again.');
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });