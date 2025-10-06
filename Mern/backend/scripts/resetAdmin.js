const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const resetAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lingualearn');
    console.log('Connected to MongoDB');

    // Find admin user
    const adminEmail = 'admin@lingualearn.com';
    let adminUser = await User.findOne({ email: adminEmail });
    
    if (!adminUser) {
      console.log('Admin user not found. Creating new admin user...');

      // Create new admin user (password will be hashed by the model)
      adminUser = new User({
        name: 'Admin User',
        email: adminEmail,
        password: 'admin123', // Will be hashed by the pre-save hook
        role: 'admin',
        emailVerified: true,
        preferences: {
          preferredLanguage: 'en',
          level: 'advanced',
          dailyGoal: 50,
          notifications: true
        },
        stats: {
          totalWordsLearned: 0,
          totalSessionsCompleted: 0,
          totalStudyTime: 0,
          averageAccuracy: 0,
          currentStreak: 0,
          lastSessionDate: new Date()
        }
      });

      await adminUser.save();
      console.log('✅ New admin user created successfully!');
    } else {
      console.log('Admin user found. Resetting password...');

      // Reset password (will be hashed by the pre-save hook)
      adminUser.password = 'admin123';
      adminUser.role = 'admin'; // Ensure role is admin
      adminUser.emailVerified = true;

      await adminUser.save();
      console.log('✅ Admin password reset successfully!');
    }

    console.log('\n📋 Admin Credentials:');
    console.log('Email:', adminEmail);
    console.log('Password: admin123');
    console.log('Role:', adminUser.role);
    
    // Verify the password works
    const isValidPassword = await bcrypt.compare('admin123', adminUser.password);
    console.log('Password verification:', isValidPassword ? '✅ Valid' : '❌ Invalid');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  }
};

resetAdmin();
