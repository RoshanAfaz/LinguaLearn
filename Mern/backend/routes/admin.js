const express = require('express');
const User = require('../models/User');
const Progress = require('../models/Progress');
const Session = require('../models/Session');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin privileges
router.use(auth, adminAuth);

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Admin only
router.get('/dashboard', async (req, res) => {
  try {
    // Get basic counts
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeUsers = await User.countDocuments({ 
      role: 'user', 
      lastActive: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    });
    const totalSessions = await Session.countDocuments();
    const totalProgress = await Progress.countDocuments();

    // Get user registration trends (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsersThisWeek = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: sevenDaysAgo }
    });

    // Get session trends (last 7 days)
    const sessionsThisWeek = await Session.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Get language popularity
    const languageStats = await Session.aggregate([
      {
        $group: {
          _id: '$language',
          sessionCount: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          language: '$_id',
          sessionCount: 1,
          userCount: { $size: '$uniqueUsers' }
        }
      },
      { $sort: { sessionCount: -1 } },
      { $limit: 10 }
    ]);

    // Get session type popularity
    const sessionTypeStats = await Session.aggregate([
      {
        $group: {
          _id: '$sessionType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get average session metrics
    const sessionMetrics = await Session.aggregate([
      {
        $group: {
          _id: null,
          avgAccuracy: { $avg: '$accuracy' },
          avgTimeSpent: { $avg: '$timeSpent' },
          avgWordsStudied: { $avg: '$wordsStudied' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsers,
          totalSessions,
          totalProgress,
          newUsersThisWeek,
          sessionsThisWeek
        },
        languageStats,
        sessionTypeStats,
        sessionMetrics: sessionMetrics[0] || {
          avgAccuracy: 0,
          avgTimeSpent: 0,
          avgWordsStudied: 0
        }
      }
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data'
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination
// @access  Admin only
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build search query
    let query = { role: 'user' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Get users with pagination
    const users = await User.find(query)
      .select('-password')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get detailed user information
// @access  Admin only
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's recent sessions
    const recentSessions = await Session.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    // Get user's progress summary
    const progressSummary = await Progress.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: '$language',
          totalWords: { $sum: 1 },
          masteredWords: {
            $sum: { $cond: [{ $gte: ['$masteryLevel', 80] }, 1, 0] }
          },
          avgMastery: { $avg: '$masteryLevel' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        user,
        recentSessions,
        progressSummary
      }
    });

  } catch (error) {
    console.error('Admin get user details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user details'
    });
  }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Update user status (activate/deactivate)
// @access  Admin only
router.put('/users/:id/status', async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user
    });

  } catch (error) {
    console.error('Admin update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user status'
    });
  }
});

// @route   GET /api/admin/analytics
// @desc    Get detailed analytics
// @access  Admin only
router.get('/analytics', async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    // Calculate date range
    let startDate;
    switch (period) {
      case '24h':
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }

    // Daily active users
    const dailyActiveUsers = await Session.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          date: '$_id.date',
          activeUsers: { $size: '$uniqueUsers' }
        }
      },
      { $sort: { date: 1 } }
    ]);

    // Session completion rates
    const completionRates = await Session.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$sessionType',
          totalSessions: { $sum: 1 },
          completedSessions: {
            $sum: { $cond: ['$completed', 1, 0] }
          }
        }
      },
      {
        $project: {
          sessionType: '$_id',
          completionRate: {
            $multiply: [
              { $divide: ['$completedSessions', '$totalSessions'] },
              100
            ]
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        period,
        dailyActiveUsers,
        completionRates
      }
    });

  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics'
    });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user account
// @access  Admin only
router.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting admin users
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }

    // Delete user's sessions and progress
    await Session.deleteMany({ userId });
    await Progress.deleteMany({ userId });

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user'
    });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Admin only
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user,
      message: 'User role updated successfully'
    });

  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user role'
    });
  }
});

// @route   PUT /api/admin/users/:id/reset-password
// @desc    Reset user password
// @access  Admin only
router.put('/users/:id/reset-password', async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Hash the new password
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password'
    });
  }
});

// @route   POST /api/admin/update-user-stats
// @desc    Update all user statistics based on completed sessions
// @access  Admin only
router.post('/update-user-stats', async (req, res) => {
  try {
    console.log('🔄 Starting user stats update...');

    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to update`);
    let updatedCount = 0;

    for (const user of users) {
      // Get all completed sessions for this user
      const completedSessions = await Session.find({
        userId: user._id,
        completed: true
      }).sort({ endTime: 1 });

      if (completedSessions.length === 0) {
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
        user.stats.totalSessionsCompleted += 1;
        user.stats.totalWordsLearned += session.wordsStudied || 0;
        user.stats.totalStudyTime += session.timeSpent || 0;

        if (session.accuracy !== undefined && session.accuracy !== null) {
          totalAccuracy += session.accuracy;
          accuracyCount += 1;
        }

        if (session.endTime) {
          const sessionDate = new Date(session.endTime);
          const dateString = sessionDate.toDateString();
          streakDays.add(dateString);

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

      if (sortedDates.length > 0) {
        const today = new Date();
        const lastSessionDate = new Date(sortedDates[0]);
        const daysSinceLastSession = Math.floor((today - lastSessionDate) / (1000 * 60 * 60 * 24));

        if (daysSinceLastSession <= 1) {
          currentStreak = 1;

          for (let i = 1; i < sortedDates.length; i++) {
            const currentDate = new Date(sortedDates[i]);
            const prevDate = new Date(sortedDates[i - 1]);
            const daysDiff = Math.floor((prevDate - currentDate) / (1000 * 60 * 60 * 24));

            if (daysDiff === 1) {
              currentStreak++;
            } else {
              break;
            }
          }
        }
      }

      user.stats.currentStreak = currentStreak;
      user.stats.maxStreak = Math.max(user.stats.maxStreak || 0, currentStreak);

      await user.save();
      updatedCount++;
    }

    res.json({
      success: true,
      message: `Updated statistics for ${updatedCount} users`,
      updatedCount
    });

  } catch (error) {
    console.error('❌ Update user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user statistics',
      error: error.message
    });
  }
});

module.exports = router;
