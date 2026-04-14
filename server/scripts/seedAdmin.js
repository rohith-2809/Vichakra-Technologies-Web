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

const PASSWORD  = (process.argv[2] && !process.argv[2].startsWith('--'))
                  ? process.argv[2]
                  : process.env.ADMIN_PASSWORD;
const RESET     = process.argv.includes('--reset');
const NAME      = 'Rohith';
const EMAIL     = process.env.ADMIN_EMAIL;

// ── Pre-validate before touching mongoose ──────────────────────────────────────
if (!EMAIL || !PASSWORD) {
  console.error('✗  ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
  process.exit(1);
}

if (PASSWORD.length < 8) {
  console.error(`\n✗  Password too short: "${PASSWORD}" is ${PASSWORD.length} char(s). Minimum is 8.\n`);
  console.error('   Example: node scripts/seedAdmin.js "MyAdmin@2026"\n');
  process.exit(1);
}

(async () => {
  if (!process.env.MONGO_URI) {
    console.error('✗  MONGO_URI not set — check server/.env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log(`✓  MongoDB: ${mongoose.connection.host}`);

  const existing = await User.findOne({ email: EMAIL }).select('+password');

  if (existing) {
    if (!RESET) {
      console.log(`ℹ  Admin already exists: ${EMAIL}`);
      console.log('   To reset their password run:');
      console.log(`   node scripts/seedAdmin.js "NewPassword@123" --reset\n`);
      process.exit(0);
    }
    // --reset: update password
    existing.password = PASSWORD;           // pre-save hook will hash it
    await existing.save();
    console.log(`\n✓  Admin password updated`);
    console.log(`   Email   : ${EMAIL}`);
    console.log(`   Password: ${PASSWORD}\n`);
    process.exit(0);
  }

  // Create new admin
  const admin = await User.create({
    name:         NAME,
    email:        EMAIL,
    password:     PASSWORD,
    role:         'admin',
    isActive:     true,
    isFirstLogin: false,
  });

  console.log(`\n✓  Admin created`);
  console.log(`   Name    : ${admin.name}`);
  console.log(`   Email   : ${admin.email}`);
  console.log(`   Password: ${PASSWORD}\n`);
  process.exit(0);
})().catch((err) => {
  console.error('\n✗  Seed failed:', err.message);
  if (err.name === 'ValidationError') {
    Object.values(err.errors).forEach((e) => console.error('  -', e.message));
  }
  process.exit(1);
});
