require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ email: 'admin@cyberedushare.com' });
  if (existing) {
    console.log('Admin already exists');
    process.exit(0);
  }

  await User.create({
    username: 'Admin',
    email: 'admin@cyberedushare.com',
    password: await bcrypt.hash('Admin@1234', 12),
    role: 'admin',
    isVerified: true,   // skip OTP for seeded admin
  });

  console.log('✅ Admin created: admin@cyberedushare.com / Admin@1234');
  process.exit(0);
}

createAdmin().catch(err => { console.error(err); process.exit(1); });