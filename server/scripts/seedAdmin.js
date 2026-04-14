/**
 * seedAdmin.js — creates or resets the admin account
 *
 * Usage:
 *   node scripts/seedAdmin.js                           # create with defaults
 *   node scripts/seedAdmin.js "MyPassword@123"          # create with custom password
 *   node scripts/seedAdmin.js "MyPassword@123" --reset  # update existing admin's password
 *
 * Positional args:
 *   [1] password  — min 8 chars  (default: VichakraAdmin@2026)
 *   [2] --reset   — if admin already exists, update their password instead of skipping
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User     = require('../src/models/User');

const ADMINS = [
  { name: 'Rohith',  email: 'rohith@vichakra.com',   password: 'VichakraAdmin@2026' },
  { name: 'Yashavi', email: 'Yashavi@Vichakra.com', password: 'VichakraAdmin@2026' },
];

const PASSWORD = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : null;
const RESET    = process.argv.includes('--reset');

(async () => {
  if (!process.env.MONGO_URI) {
    console.error('✗  MONGO_URI not set — check server/.env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log(`✓  MongoDB: ${mongoose.connection.host}`);

  for (const data of ADMINS) {
    const existing = await User.findOne({ email: data.email });
    if (existing) {
      if (RESET) {
        existing.password = PASSWORD || data.password;
        await existing.save();
        console.log(`✓  Admin ${data.email} password updated`);
      } else {
        console.log(`ℹ  Admin ${data.email} already exists`);
      }
    } else {
      await User.create({
        ...data,
        password:     PASSWORD || data.password,
        role:         'admin',
        isActive:     true,
        isFirstLogin: false,
      });
      console.log(`✓  Admin created: ${data.name} (${data.email})`);
    }
  }

  console.log('\n✓  Seeding complete.\n');
  process.exit(0);
})().catch((err) => {
  console.error('\n✗  Seed failed:', err.message);
  if (err.name === 'ValidationError') {
    Object.values(err.errors).forEach((e) => console.error('  -', e.message));
  }
  process.exit(1);
});
