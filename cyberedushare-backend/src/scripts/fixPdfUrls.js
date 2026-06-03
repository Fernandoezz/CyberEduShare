require('dotenv').config();
const mongoose = require('mongoose');
const Content = require('../models/Content');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const resources = await Content.find({
    $or: [
      { type: 'PDF' },
      { fileUrl: { $regex: '\\.pdf($|\\?)', $options: 'i' } }
    ]
  });

  let updated = 0;

  for (const item of resources) {
    let changed = false;

    if (item.fileUrl && item.fileUrl.includes('/image/upload/')) {
      item.fileUrl = item.fileUrl.replace('/image/upload/', '/raw/upload/');
      changed = true;
    }

    if (item.cloudinaryResourceType !== 'raw') {
      item.cloudinaryResourceType = 'raw';
      changed = true;
    }

    if (changed) {
      await item.save();
      updated++;
      console.log(`Updated: ${item.title}`);
    }
  }

  console.log(`Done. Updated ${updated} resources.`);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});