const express = require('express');
const { body, validationResult } = require('express-validator');
const Progress = require('../models/Progress');
const Session = require('../models/Session');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const achievementService = require('../services/achievementService');

const router = express.Router();

// All progress routes require authentication
router.use(auth);

// @route   GET /api/progress/:language
// @desc    Get user progress for a specific language
// @access  Private
router.get('/:language', async (req, res) => {
  try {
    const { language } = req.params;
    
    const progress = await Progress.find({
      userId: req.user.userId,
      language: language
    }).sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: progress
    });

  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/progress/update
// @desc    Update word progress
// @access  Private
router.post('/update', [
  body('language').notEmpty().withMessage('Language is required'),
  body('wordId').notEmpty().withMessage('Word ID is required'),
  body('word').notEmpty().withMessage('Word is required'),
  body('translation').notEmpty().withMessage('Translation is required'),
  body('isCorrect').isBoolean().withMessage('isCorrect must be a boolean'),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard']),
  body('category').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { language, wordId, word, translation, isCorrect, difficulty, category } = req.body;

    // Find existing progress or create new
    let progress = await Progress.findOne({
      userId: req.user.userId,
      language,
      wordId
    });

    if (!progress) {
      progress = new Progress({
        userId: req.user.userId,
        language,
        wordId,
        word,
        translation,
        difficulty: difficulty || 'medium',
        category: category || 'general'
      });
    }

    // Update progress
    await progress.updateProgress(isCorrect);

    res.json({
      success: true,
      message: 'Progress updated successfully',
      progress
    });

  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/progress/session
// @desc    Create a new learning session
// @access  Private
router.post('/session', [
  body('language').notEmpty().withMessage('Language is required'),
  body('sessionType').isIn(['flashcards', 'quiz', 'typing', 'smart-review', 'games', 'chat'])
    .withMessage('Invalid session type'),
  body('wordsStudied').optional().isInt({ min: 0 }),
  body('correctAnswers').optional().isInt({ min: 0 }),
  body('totalAnswers').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const sessionData = {
      userId: req.user.userId,
      ...req.body
    };

    const session = new Session(sessionData);
    await session.save();

    // Check for achievements after session creation
    achievementService.checkAchievements(req.user.userId, session).catch(error => {
      console.error('Failed to check achievements:', error);
    });

    res.status(201).json({
      success: true,
      message: 'Session created successfully',
      session
    });

  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/progress/session/:sessionId
// @desc    Update/complete a learning session
// @access  Private
router.put('/session/:sessionId', [
  body('wordsStudied').optional().isInt({ min: 0 }),
  body('correctAnswers').optional().isInt({ min: 0 }),
  body('totalAnswers').optional().isInt({ min: 0 }),
  body('score').optional().isInt({ min: 0 }),
  body('completed').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const session = await Session.findOne({
      _id: req.params.sessionId,
      userId: req.user.userId
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Update session fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        session[key] = req.body[key];
      }
    });

    // Complete session if requested
    if (req.body.completed) {
      await session.completeSession();

      // Check for achievements after session completion
      achievementService.checkAchievements(req.user.userId, session).catch(error => {
        console.error('Failed to check achievements:', error);
      });

      // Check for milestone achievements
      const user = await User.findById(req.user.userId);
      if (user) {
        achievementService.checkMilestoneAchievements(req.user.userId, 'wordsLearned', user.stats.totalWordsLearned).catch(console.error);
        achievementService.checkMilestoneAchievements(req.user.userId, 'sessionsCompleted', user.stats.totalSessionsCompleted).catch(console.error);
        achievementService.checkMilestoneAchievements(req.user.userId, 'studyTime', user.stats.totalStudyTime).catch(console.error);
        achievementService.checkStreakAchievements(req.user.userId, user.stats.currentStreak).catch(console.error);
      }
    } else {
      await session.save();
    }

    res.json({
      success: true,
      message: 'Session updated successfully',
      session
    });

  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/progress/sessions
// @desc    Get user's learning sessions
// @access  Private
router.get('/sessions/history', async (req, res) => {
  try {
    const { language, sessionType, limit = 20, page = 1 } = req.query;
    
    const query = { userId: req.user.userId };
    if (language) query.language = language;
    if (sessionType) query.sessionType = sessionType;

    const skip = (page - 1) * limit;

    const sessions = await Session.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalSessions = await Session.countDocuments(query);

    res.json({
      success: true,
      data: {
        sessions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalSessions / limit),
          totalSessions,
          hasNext: skip + sessions.length < totalSessions,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/progress/stats/:language
// @desc    Get progress statistics for a language
// @access  Private
router.get('/stats/:language', async (req, res) => {
  try {
    const { language } = req.params;

    // Get progress stats
    const progressStats = await Progress.aggregate([
      { $match: { userId: req.user.userId, language } },
      {
        $group: {
          _id: null,
          totalWords: { $sum: 1 },
          masteredWords: {
            $sum: { $cond: [{ $gte: ['$masteryLevel', 80] }, 1, 0] }
          },
          averageMastery: { $avg: '$masteryLevel' },
          totalAttempts: { $sum: '$totalAttempts' },
          totalCorrect: { $sum: '$correctAnswers' }
        }
      }
    ]);

    // Get session stats
    const sessionStats = await Session.aggregate([
      { $match: { userId: req.user.userId, language } },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          totalStudyTime: { $sum: '$timeSpent' },
          averageAccuracy: { $avg: '$accuracy' },
          totalWordsStudied: { $sum: '$wordsStudied' }
        }
      }
    ]);

    const stats = {
      progress: progressStats[0] || {
        totalWords: 0,
        masteredWords: 0,
        averageMastery: 0,
        totalAttempts: 0,
        totalCorrect: 0
      },
      sessions: sessionStats[0] || {
        totalSessions: 0,
        totalStudyTime: 0,
        averageAccuracy: 0,
        totalWordsStudied: 0
      }
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get progress stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/progress/achievements
// @desc    Get user achievements
// @access  Private
router.get('/achievements', auth, async (req, res) => {
  try {
    const userAchievements = await achievementService.getUserAchievements(req.user.userId);
    const allAchievements = achievementService.getAllAchievements();

    res.json({
      success: true,
      data: {
        userAchievements,
        allAchievements,
        unlockedCount: userAchievements.length,
        totalCount: allAchievements.length
      }
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/progress/check-achievements
// @desc    Manually trigger achievement check
// @access  Private
router.post('/check-achievements', auth, async (req, res) => {
  try {
    const newAchievements = await achievementService.checkAchievements(req.user.userId);

    res.json({
      success: true,
      message: `Checked achievements. Found ${newAchievements.length} new achievements.`,
      newAchievements
    });
  } catch (error) {
    console.error('Check achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
