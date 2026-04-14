const User = require('../models/User');

const autoSeedAdmins = async () => {
  try {
    // Check if any admin already exists
    const adminCount = await User.countDocuments({ role: 'admin' });
    
    if (adminCount > 0) {
      // console.log('ℹ  Admins already exist, skipping auto-seed');
      return;
    }

    const admins = [
      { 
        name:     process.env.ADMIN_NAME || 'Rohith',  
        email:    process.env.ADMIN_EMAIL, 
        password: process.env.ADMIN_PASSWORD 
      },
      { 
        name:     process.env.ADMIN2_NAME || 'Yashavi', 
        email:    process.env.ADMIN2_EMAIL, 
        password: process.env.ADMIN2_PASSWORD 
      },
    ].filter(admin => admin.email && admin.password);

    if (admins.length === 0) {
      console.warn('⚠  No admin credentials found in environment variables. skipping auto-seed.');
      return;
    }

    console.log('🚀 Starting auto-seed for admin accounts...');
    
    for (const data of admins) {
      await User.create({
        ...data,
        role:         'admin',
        isActive:     true,
        isFirstLogin: false,
      });
      console.log(`✓  Auto-seeded admin: ${data.name} (${data.email})`);
    }
    
    console.log('✅  Auto-seeding complete.');
  } catch (err) {
    console.error('✗  Auto-seed failed:', err.message);
  }
};

module.exports = autoSeedAdmins;
