const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// All user routes require authentication
router.use(auth);

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('preferences.preferredLanguage')
    .optional()
    .isLength({ min: 2, max: 5 })
    .withMessage('Invalid language code'),
  body('preferences.level')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Invalid level'),
  body('preferences.dailyGoal')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Daily goal must be between 1 and 100')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const updates = {};
    const { name, avatar, preferences } = req.body;

    if (name) updates.name = name;
    if (avatar) updates.avatar = avatar;
    if (preferences) {
      updates.preferences = { ...req.userDoc.preferences, ...preferences };
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/users/stats
// @desc    Update user statistics
// @access  Private
router.put('/stats', [
  body('totalWordsLearned').optional().isInt({ min: 0 }),
  body('totalSessionsCompleted').optional().isInt({ min: 0 }),
  body('currentStreak').optional().isInt({ min: 0 }),
  body('longestStreak').optional().isInt({ min: 0 }),
  body('totalStudyTime').optional().isInt({ min: 0 }),
  body('averageAccuracy').optional().isFloat({ min: 0, max: 100 })
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

    const statsUpdate = {};
    const allowedStats = [
      'totalWordsLearned',
      'totalSessionsCompleted', 
      'currentStreak',
      'longestStreak',
      'totalStudyTime',
      'averageAccuracy'
    ];

    allowedStats.forEach(stat => {
      if (req.body[stat] !== undefined) {
        statsUpdate[`stats.${stat}`] = req.body[stat];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: statsUpdate },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Statistics updated successfully',
      stats: user.stats
    });

  } catch (error) {
    console.error('Update stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/users/account
// @desc    Delete user account
// @access  Private
router.delete('/account', async (req, res) => {
  try {
    // Instead of deleting, we'll deactivate the account
    await User.findByIdAndUpdate(req.user.userId, { 
      isActive: false,
      email: `deleted_${Date.now()}_${req.userDoc.email}` // Prevent email conflicts
    });

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/dashboard
// @desc    Get user dashboard data
// @access  Private
router.get('/dashboard', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    // This would typically include recent progress, upcoming reviews, etc.
    // For now, we'll return basic user data
    res.json({
      success: true,
      data: {
        user: user.getPublicProfile(),
        // Add more dashboard data here as needed
        recentActivity: [],
        upcomingReviews: [],
        achievements: []
      }
    });

  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
