require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Session = require('./models/Session');

const testUpdateStats = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lingualearn');
    console.log('✅ Connected to MongoDB');

    // Get all users
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users`);

    // Get all sessions
    const sessions = await Session.find({});
    console.log(`📚 Found ${sessions.length} total sessions`);

    const completedSessions = await Session.find({ completed: true });
    console.log(`✅ Found ${completedSessions.length} completed sessions`);

    // Show current user stats
    console.log('\n📈 Current User Stats:');
    for (const user of users) {
      console.log(`${user.name}: ${user.stats.totalWordsLearned} words, ${user.stats.totalSessionsCompleted} sessions, ${user.stats.currentStreak} day streak`);
    }

    // Test the update logic for first user
    if (users.length > 0) {
      const testUser = users[0];
      console.log(`\n🧪 Testing update for user: ${testUser.name}`);
      
      const userSessions = await Session.find({ 
        userId: testUser._id, 
        completed: true 
      });
      
      console.log(`Found ${userSessions.length} completed sessions for this user`);
      
      if (userSessions.length > 0) {
        console.log('Session details:');
        userSessions.forEach((session, index) => {
          console.log(`  ${index + 1}. Words: ${session.wordsStudied || 0}, Time: ${session.timeSpent || 0}min, Accuracy: ${session.accuracy || 0}%`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

testUpdateStats();
