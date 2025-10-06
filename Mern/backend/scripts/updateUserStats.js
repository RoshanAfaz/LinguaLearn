const mongoose = require('mongoose');
const User = require('../models/User');
const Session = require('../models/Session');
require('dotenv').config();

const updateAllUserStats = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lingualearn');
    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to update`);

    for (const user of users) {
      console.log(`\n📊 Updating stats for user: ${user.name} (${user.email})`);
      
      // Get all completed sessions for this user
      const completedSessions = await Session.find({ 
        userId: user._id, 
        completed: true 
      }).sort({ endTime: 1 });

      console.log(`Found ${completedSessions.length} completed sessions`);

      if (completedSessions.length === 0) {
        console.log('No completed sessions, skipping...');
        continue;
      }

      // Reset stats
      user.stats = {
        totalWordsLearned: 0,
        totalSessionsCompleted: 0,
        totalStudyTime: 0,
        averageAccuracy: 0,
        currentStreak: 0,
        maxStreak: 0,
        lastSessionDate: null
      };

      let totalAccuracy = 0;
      let accuracyCount = 0;
      let streakDays = new Set();

      // Process each session
      for (const session of completedSessions) {
        // Update basic stats
        user.stats.totalSessionsCompleted += 1;
        user.stats.totalWordsLearned += session.wordsStudied || 0;
        user.stats.totalStudyTime += session.timeSpent || 0;
        
        // Track accuracy
        if (session.accuracy !== undefined && session.accuracy !== null) {
          totalAccuracy += session.accuracy;
          accuracyCount += 1;
        }
        
        // Track session dates for streak calculation
        if (session.endTime) {
          const sessionDate = new Date(session.endTime);
          const dateString = sessionDate.toDateString();
          streakDays.add(dateString);
          
          // Update last session date
          if (!user.stats.lastSessionDate || sessionDate > user.stats.lastSessionDate) {
            user.stats.lastSessionDate = sessionDate;
          }
        }
      }

      // Calculate average accuracy
      if (accuracyCount > 0) {
        user.stats.averageAccuracy = Math.round(totalAccuracy / accuracyCount);
      }

      // Calculate current streak
      const sortedDates = Array.from(streakDays).sort((a, b) => new Date(b) - new Date(a));
      let currentStreak = 0;
      let maxStreak = 0;
      let tempStreak = 0;
      
      if (sortedDates.length > 0) {
        const today = new Date();
        const lastSessionDate = new Date(sortedDates[0]);
        const daysSinceLastSession = Math.floor((today - lastSessionDate) / (1000 * 60 * 60 * 24));
        
        // Check if streak is still active (within 1 day)
        if (daysSinceLastSession <= 1) {
          currentStreak = 1;
          tempStreak = 1;
          
          // Count consecutive days backwards
          for (let i = 1; i < sortedDates.length; i++) {
            const currentDate = new Date(sortedDates[i]);
            const prevDate = new Date(sortedDates[i - 1]);
            const daysDiff = Math.floor((prevDate - currentDate) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === 1) {
              currentStreak++;
              tempStreak++;
            } else {
              if (tempStreak > maxStreak) maxStreak = tempStreak;
              tempStreak = 1;
            }
          }
        }
        
        if (tempStreak > maxStreak) maxStreak = tempStreak;
      }

      user.stats.currentStreak = currentStreak;
      user.stats.maxStreak = Math.max(maxStreak, currentStreak);

      // Save updated user
      await user.save();

      console.log(`✅ Updated stats:`);
      console.log(`   - Words learned: ${user.stats.totalWordsLearned}`);
      console.log(`   - Sessions completed: ${user.stats.totalSessionsCompleted}`);
      console.log(`   - Study time: ${user.stats.totalStudyTime} minutes`);
      console.log(`   - Average accuracy: ${user.stats.averageAccuracy}%`);
      console.log(`   - Current streak: ${user.stats.currentStreak} days`);
      console.log(`   - Max streak: ${user.stats.maxStreak} days`);
    }

    console.log('\n🎉 All user stats updated successfully!');

  } catch (error) {
    console.error('❌ Error updating user stats:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

updateAllUserStats();
