const User = require('../models/User');
const Session = require('../models/Session');
const Progress = require('../models/Progress');
const emailService = require('./emailService');

class AchievementService {
  constructor() {
    this.achievements = {
      // Learning Milestones
      FIRST_LESSON: {
        id: 'first_lesson',
        title: 'First Steps',
        description: 'Completed your first learning session',
        icon: '🎯',
        type: 'milestone',
        condition: (stats) => stats.totalSessionsCompleted >= 1
      },
      WEEK_STREAK: {
        id: 'week_streak',
        title: 'Week Warrior',
        description: 'Maintained a 7-day learning streak',
        icon: '🔥',
        type: 'streak',
        condition: (stats) => stats.currentStreak >= 7
      },
      MONTH_STREAK: {
        id: 'month_streak',
        title: 'Monthly Master',
        description: 'Maintained a 30-day learning streak',
        icon: '🏆',
        type: 'streak',
        condition: (stats) => stats.currentStreak >= 30
      },
      HUNDRED_WORDS: {
        id: 'hundred_words',
        title: 'Vocabulary Builder',
        description: 'Learned 100 new words',
        icon: '📚',
        type: 'milestone',
        condition: (stats) => stats.totalWordsLearned >= 100
      },
      FIVE_HUNDRED_WORDS: {
        id: 'five_hundred_words',
        title: 'Word Master',
        description: 'Learned 500 new words',
        icon: '🌟',
        type: 'milestone',
        condition: (stats) => stats.totalWordsLearned >= 500
      },
      PERFECT_SCORE: {
        id: 'perfect_score',
        title: 'Perfectionist',
        description: 'Achieved 100% accuracy in a session',
        icon: '💯',
        type: 'achievement',
        condition: (stats, sessionData) => sessionData && sessionData.accuracy === 100
      },
      SPEED_DEMON: {
        id: 'speed_demon',
        title: 'Speed Demon',
        description: 'Completed 50 words in under 5 minutes',
        icon: '⚡',
        type: 'achievement',
        condition: (stats, sessionData) => {
          return sessionData && 
                 sessionData.wordsStudied >= 50 && 
                 sessionData.timeSpent <= 5;
        }
      },
      DEDICATED_LEARNER: {
        id: 'dedicated_learner',
        title: 'Dedicated Learner',
        description: 'Completed 50 learning sessions',
        icon: '🎓',
        type: 'milestone',
        condition: (stats) => stats.totalSessionsCompleted >= 50
      },
      POLYGLOT: {
        id: 'polyglot',
        title: 'Polyglot',
        description: 'Studied 3 different languages',
        icon: '🌍',
        type: 'achievement',
        condition: async (stats, sessionData, userId) => {
          const sessions = await Session.find({ userId }).distinct('language');
          return sessions.length >= 3;
        }
      },
      NIGHT_OWL: {
        id: 'night_owl',
        title: 'Night Owl',
        description: 'Completed a session after 10 PM',
        icon: '🦉',
        type: 'achievement',
        condition: (stats, sessionData) => {
          if (!sessionData || !sessionData.endTime) return false;
          const hour = new Date(sessionData.endTime).getHours();
          return hour >= 22 || hour <= 5;
        }
      },
      EARLY_BIRD: {
        id: 'early_bird',
        title: 'Early Bird',
        description: 'Completed a session before 7 AM',
        icon: '🐦',
        type: 'achievement',
        condition: (stats, sessionData) => {
          if (!sessionData || !sessionData.endTime) return false;
          const hour = new Date(sessionData.endTime).getHours();
          return hour >= 5 && hour <= 7;
        }
      }
    };
  }

  async checkAchievements(userId, sessionData = null) {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      const userAchievements = user.achievements || [];
      const newAchievements = [];

      for (const [key, achievement] of Object.entries(this.achievements)) {
        // Skip if user already has this achievement
        if (userAchievements.some(a => a.id === achievement.id)) {
          continue;
        }

        let isUnlocked = false;

        // Check if condition is async (for complex achievements)
        if (typeof achievement.condition === 'function') {
          if (achievement.condition.constructor.name === 'AsyncFunction') {
            isUnlocked = await achievement.condition(user.stats, sessionData, userId);
          } else {
            isUnlocked = achievement.condition(user.stats, sessionData);
          }
        }

        if (isUnlocked) {
          const newAchievement = {
            id: achievement.id,
            title: achievement.title,
            description: achievement.description,
            icon: achievement.icon,
            type: achievement.type,
            unlockedAt: new Date()
          };

          newAchievements.push(newAchievement);
          userAchievements.push(newAchievement);

          // Send achievement email
          await this.sendAchievementEmail(user, newAchievement);
        }
      }

      // Update user achievements if any new ones were unlocked
      if (newAchievements.length > 0) {
        await User.findByIdAndUpdate(userId, {
          $set: { achievements: userAchievements }
        });

        console.log(`User ${user.name} unlocked ${newAchievements.length} new achievements:`, 
                   newAchievements.map(a => a.title));
      }

      return newAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  }

  async sendAchievementEmail(user, achievement) {
    try {
      await emailService.sendAchievementEmail(user, achievement);
    } catch (error) {
      console.error('Failed to send achievement email:', error);
    }
  }

  async checkStreakAchievements(userId, streakDays) {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      // Send streak emails for milestone streaks
      const streakMilestones = [7, 14, 30, 50, 100];
      
      if (streakMilestones.includes(streakDays)) {
        await emailService.sendStreakEmail(user, streakDays);
      }

      // Check for streak-based achievements
      await this.checkAchievements(userId);
    } catch (error) {
      console.error('Error checking streak achievements:', error);
    }
  }

  async checkMilestoneAchievements(userId, milestoneType, value) {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      const milestone = {
        type: milestoneType,
        value: value,
        unit: this.getMilestoneUnit(milestoneType),
        message: this.getMilestoneMessage(milestoneType, value)
      };

      // Send milestone email for significant milestones
      const significantMilestones = {
        'wordsLearned': [50, 100, 250, 500, 1000],
        'sessionsCompleted': [10, 25, 50, 100, 200],
        'studyTime': [60, 300, 600, 1200] // in minutes
      };

      if (significantMilestones[milestoneType]?.includes(value)) {
        await emailService.sendMilestoneEmail(user, milestone);
      }

      // Check for milestone-based achievements
      await this.checkAchievements(userId);
    } catch (error) {
      console.error('Error checking milestone achievements:', error);
    }
  }

  getMilestoneUnit(type) {
    const units = {
      'wordsLearned': 'Words',
      'sessionsCompleted': 'Sessions',
      'studyTime': 'Minutes'
    };
    return units[type] || 'Points';
  }

  getMilestoneMessage(type, value) {
    const messages = {
      'wordsLearned': `You've mastered ${value} words! Your vocabulary is growing stronger every day.`,
      'sessionsCompleted': `${value} learning sessions completed! Your consistency is impressive.`,
      'studyTime': `${value} minutes of focused learning! Time well invested in your future.`
    };
    return messages[type] || `You've reached ${value} ${this.getMilestoneUnit(type)}!`;
  }

  async getUserAchievements(userId) {
    try {
      const user = await User.findById(userId);
      return user?.achievements || [];
    } catch (error) {
      console.error('Error getting user achievements:', error);
      return [];
    }
  }

  getAllAchievements() {
    return Object.values(this.achievements);
  }
}

module.exports = new AchievementService();
