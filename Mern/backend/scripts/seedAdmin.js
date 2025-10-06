const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lingualearn', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL || 'admin@lingualearn.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: process.env.ADMIN_EMAIL || 'admin@lingualearn.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role: 'admin',
      emailVerified: true,
      preferences: {
        preferredLanguage: 'en',
        level: 'advanced',
        dailyGoal: 50,
        notifications: true
      }
    });

    await adminUser.save();
    console.log('Admin user created successfully');
    console.log('Email:', adminUser.email);
    console.log('Password:', process.env.ADMIN_PASSWORD || 'admin123');

  } catch (error) {
    console.error('Error seeding admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

seedAdmin();
