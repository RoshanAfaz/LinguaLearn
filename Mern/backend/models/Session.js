const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  language: {
    type: String,
    required: true
  },
  sessionType: {
    type: String,
    enum: ['flashcards', 'quiz', 'typing', 'smart-review', 'games', 'chat'],
    required: true
  },
  wordsStudied: {
    type: Number,
    default: 0
  },
  correctAnswers: {
    type: Number,
    default: 0
  },
  totalAnswers: {
    type: Number,
    default: 0
  },
  accuracy: {
    type: Number,
    default: 0
  },
  timeSpent: {
    type: Number,
    default: 0 // in minutes
  },
  score: {
    type: Number,
    default: 0
  },
  completed: {
    type: Boolean,
    default: false
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient queries
sessionSchema.index({ userId: 1, createdAt: -1 });
sessionSchema.index({ userId: 1, language: 1 });
sessionSchema.index({ sessionType: 1 });

// Calculate accuracy before saving
sessionSchema.pre('save', function(next) {
  if (this.totalAnswers > 0) {
    this.accuracy = Math.round((this.correctAnswers / this.totalAnswers) * 100);
  }
  next();
});

// Complete session method
sessionSchema.methods.completeSession = async function() {
  this.completed = true;
  this.endTime = Date.now();
  if (this.startTime) {
    this.timeSpent = Math.round((this.endTime - this.startTime) / (1000 * 60)); // Convert to minutes
  }

  await this.save();

  // Update user statistics
  await this.updateUserStats();

  return this;
};

// Update user statistics based on session data
sessionSchema.methods.updateUserStats = async function() {
  const User = require('./User');

  try {
    const user = await User.findById(this.userId);
    if (!user) return;

    // Update basic stats
    user.stats.totalSessionsCompleted += 1;
    user.stats.totalWordsLearned += this.wordsStudied || 0;
    user.stats.totalStudyTime += this.timeSpent || 0;

    // Update accuracy (weighted average)
    if (this.accuracy !== undefined) {
      const totalSessions = user.stats.totalSessionsCompleted;
      const currentAvg = user.stats.averageAccuracy || 0;
      user.stats.averageAccuracy = Math.round(
        ((currentAvg * (totalSessions - 1)) + this.accuracy) / totalSessions
      );
    }

    // Update streak
    const today = new Date();
    const lastSession = user.stats.lastSessionDate ? new Date(user.stats.lastSessionDate) : null;

    if (lastSession) {
      const daysDiff = Math.floor((today - lastSession) / (1000 * 60 * 60 * 24));

      if (daysDiff === 0) {
        // Same day, don't change streak
      } else if (daysDiff === 1) {
        // Consecutive day, increment streak
        user.stats.currentStreak += 1;
      } else {
        // Streak broken, reset to 1
        user.stats.currentStreak = 1;
      }
    } else {
      // First session ever
      user.stats.currentStreak = 1;
    }

    // Update last session date
    user.stats.lastSessionDate = today;

    // Update max streak if current is higher
    if (user.stats.currentStreak > (user.stats.maxStreak || 0)) {
      user.stats.maxStreak = user.stats.currentStreak;
    }

    await user.save();
    console.log(`✅ Updated stats for user ${user.name}: ${user.stats.totalWordsLearned} words, ${user.stats.totalSessionsCompleted} sessions, ${user.stats.currentStreak} day streak`);

  } catch (error) {
    console.error('Error updating user stats:', error);
  }
};

module.exports = mongoose.model('Session', sessionSchema);
