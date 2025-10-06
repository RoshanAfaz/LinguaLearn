const mongoose = require('mongoose');
const User = require('../models/User');
const Session = require('../models/Session');
const Progress = require('../models/Progress');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lingualearn');
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const seedSessions = async () => {
  try {
    await connectDB();

    // Get all users
    const users = await User.find({ role: 'user' });
    
    if (users.length === 0) {
      console.log('No users found. Please create some users first.');
      return;
    }

    console.log(`Found ${users.length} users. Creating sample sessions...`);

    const languages = ['es', 'fr', 'de', 'it', 'pt', 'hi', 'ja', 'ko', 'zh'];
    const sessionTypes = ['flashcards', 'quiz', 'typing', 'smart-review', 'games', 'chat'];

    const sessions = [];
    const progressEntries = [];

    // Create sessions for each user
    for (const user of users) {
      // Create 5-15 sessions per user
      const sessionCount = Math.floor(Math.random() * 11) + 5;
      
      for (let i = 0; i < sessionCount; i++) {
        const language = languages[Math.floor(Math.random() * languages.length)];
        const sessionType = sessionTypes[Math.floor(Math.random() * sessionTypes.length)];
        const wordsStudied = Math.floor(Math.random() * 20) + 5;
        const totalAnswers = Math.floor(Math.random() * 30) + 10;
        const correctAnswers = Math.floor(totalAnswers * (0.6 + Math.random() * 0.4)); // 60-100% accuracy
        const timeSpent = Math.floor(Math.random() * 45) + 5; // 5-50 minutes
        const score = correctAnswers * 10 + Math.floor(Math.random() * 50);

        // Create session date within last 30 days
        const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
        const startTime = new Date(createdAt.getTime() - timeSpent * 60 * 1000);
        const endTime = createdAt;

        const session = {
          userId: user._id,
          language,
          sessionType,
          wordsStudied,
          correctAnswers,
          totalAnswers,
          accuracy: Math.round((correctAnswers / totalAnswers) * 100),
          timeSpent,
          score,
          completed: true,
          startTime,
          endTime,
          createdAt
        };

        sessions.push(session);

        // Create corresponding progress entry
        const progress = {
          userId: user._id,
          language,
          sessionType,
          wordsLearned: wordsStudied,
          accuracy: session.accuracy,
          timeSpent,
          score,
          sessionDate: createdAt,
          createdAt
        };

        progressEntries.push(progress);
      }
    }

    // Clear existing sessions and progress
    await Session.deleteMany({});
    await Progress.deleteMany({});

    // Insert new sessions and progress
    await Session.insertMany(sessions);
    await Progress.insertMany(progressEntries);

    console.log(`Created ${sessions.length} sessions and ${progressEntries.length} progress entries`);

    // Update user stats
    for (const user of users) {
      const userSessions = sessions.filter(s => s.userId.toString() === user._id.toString());
      const userProgress = progressEntries.filter(p => p.userId.toString() === user._id.toString());

      const totalWordsLearned = userProgress.reduce((sum, p) => sum + p.wordsLearned, 0);
      const totalSessionsCompleted = userSessions.length;
      const totalStudyTime = userSessions.reduce((sum, s) => sum + s.timeSpent, 0);
      const avgAccuracy = userSessions.reduce((sum, s) => sum + s.accuracy, 0) / userSessions.length;

      // Calculate current streak (consecutive days with sessions)
      const sessionDates = userSessions
        .map(s => s.createdAt.toDateString())
        .filter((date, index, arr) => arr.indexOf(date) === index)
        .sort((a, b) => new Date(b) - new Date(a));

      let currentStreak = 0;
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

      if (sessionDates.includes(today) || sessionDates.includes(yesterday)) {
        currentStreak = 1;
        for (let i = 1; i < sessionDates.length; i++) {
          const currentDate = new Date(sessionDates[i]);
          const prevDate = new Date(sessionDates[i - 1]);
          const diffDays = (prevDate - currentDate) / (1000 * 60 * 60 * 24);
          
          if (diffDays === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      }

      // Update user with stats
      await User.findByIdAndUpdate(user._id, {
        $set: {
          'stats.totalWordsLearned': totalWordsLearned,
          'stats.totalSessionsCompleted': totalSessionsCompleted,
          'stats.totalStudyTime': totalStudyTime,
          'stats.averageAccuracy': Math.round(avgAccuracy),
          'stats.currentStreak': currentStreak,
          'stats.lastSessionDate': userSessions[userSessions.length - 1]?.createdAt || new Date(),
          lastActive: new Date()
        }
      });
    }

    console.log('Updated user statistics');
    console.log('Sample data seeding completed successfully!');

  } catch (error) {
    console.error('Error seeding sessions:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seeding
if (require.main === module) {
  seedSessions();
}

module.exports = seedSessions;
