const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');
const emailService = require('../services/emailService');

const router = express.Router();

// All notification routes require admin authentication
router.use(auth, adminAuth);

// @route   POST /api/notifications/send
// @desc    Send notification email to users
// @access  Admin
router.post('/send', [
  body('recipientType').isIn(['all', 'active', 'inactive', 'specific']).withMessage('Invalid recipient type'),
  body('subject').trim().isLength({ min: 1, max: 200 }).withMessage('Subject is required and must be less than 200 characters'),
  body('message').trim().isLength({ min: 1, max: 2000 }).withMessage('Message is required and must be less than 2000 characters'),
  body('emailType').optional().isIn(['announcement', 'update', 'promotion', 'reminder']).withMessage('Invalid email type'),
  body('specificUsers').optional().isArray().withMessage('Specific users must be an array'),
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

    const { recipientType, subject, message, emailType = 'announcement', specificUsers } = req.body;

    // Get recipients based on type
    let recipients = [];
    switch (recipientType) {
      case 'all':
        recipients = await User.find({}, 'name email');
        break;
      case 'active':
        recipients = await User.find({ isActive: true }, 'name email');
        break;
      case 'inactive':
        recipients = await User.find({ isActive: false }, 'name email');
        break;
      case 'specific':
        if (!specificUsers || specificUsers.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'Specific users must be provided'
          });
        }
        recipients = await User.find({ _id: { $in: specificUsers } }, 'name email');
        break;
    }

    if (recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No recipients found'
      });
    }

    // Send emails to all recipients
    const emailPromises = recipients.map(user => 
      emailService.sendCustomEmail(user, {
        subject,
        message,
        type: emailType
      })
    );

    const results = await Promise.allSettled(emailPromises);
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;

    // Log notification in database (you might want to create a Notification model)
    const notificationLog = {
      adminId: req.user.userId,
      recipientType,
      subject,
      message,
      emailType,
      recipientCount: recipients.length,
      successCount: successful,
      failedCount: failed,
      sentAt: new Date()
    };

    // For now, we'll just log it. In production, save to a Notifications collection
    console.log('Notification sent:', notificationLog);

    res.json({
      success: true,
      message: `Notification sent successfully to ${successful} recipients`,
      data: {
        totalRecipients: recipients.length,
        successful,
        failed,
        recipients: recipients.map(r => ({ id: r._id, name: r.name, email: r.email }))
      }
    });

  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending notification'
    });
  }
});

// @route   POST /api/notifications/test
// @desc    Send test email
// @access  Admin
router.post('/test', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('type').isIn(['welcome', 'achievement', 'milestone', 'streak', 'custom']).withMessage('Invalid email type'),
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

    const { email, type, customData } = req.body;
    const testUser = { name: 'Test User', email };

    let result;
    switch (type) {
      case 'welcome':
        result = await emailService.sendWelcomeEmail(testUser);
        break;
      case 'achievement':
        const testAchievement = customData?.achievement || {
          title: 'Test Achievement',
          description: 'This is a test achievement email',
          icon: '🏆'
        };
        result = await emailService.sendAchievementEmail(testUser, testAchievement);
        break;
      case 'milestone':
        const testMilestone = customData?.milestone || {
          type: 'Words Learned',
          value: 100,
          unit: 'Words',
          message: 'You\'ve mastered 100 words! Great progress!'
        };
        result = await emailService.sendMilestoneEmail(testUser, testMilestone);
        break;
      case 'streak':
        const streakDays = customData?.streakDays || 7;
        result = await emailService.sendStreakEmail(testUser, streakDays);
        break;
      case 'custom':
        result = await emailService.sendCustomEmail(testUser, {
          subject: customData?.subject || 'Test Email',
          message: customData?.message || 'This is a test email from LinguaLearn admin panel.',
          type: 'announcement'
        });
        break;
    }

    res.json({
      success: true,
      message: `Test ${type} email sent successfully`,
      result
    });

  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending test email',
      error: error.message
    });
  }
});

// @route   GET /api/notifications/history
// @desc    Get notification history
// @access  Admin
router.get('/history', async (req, res) => {
  try {
    // In a real app, you'd fetch from a Notifications collection
    // For now, return mock data
    const mockHistory = [
      {
        id: '1',
        subject: 'Welcome to LinguaLearn Updates!',
        message: 'We have exciting new features to share with you...',
        recipientType: 'all',
        recipientCount: 150,
        successCount: 148,
        failedCount: 2,
        emailType: 'announcement',
        sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        sentBy: 'Admin User'
      },
      {
        id: '2',
        subject: 'New Language Added: Japanese!',
        message: 'Start learning Japanese with our new interactive lessons...',
        recipientType: 'active',
        recipientCount: 120,
        successCount: 120,
        failedCount: 0,
        emailType: 'update',
        sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        sentBy: 'Admin User'
      },
      {
        id: '3',
        subject: 'Special Offer: Premium Features',
        message: 'Get 50% off on premium features this month...',
        recipientType: 'active',
        recipientCount: 95,
        successCount: 93,
        failedCount: 2,
        emailType: 'promotion',
        sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        sentBy: 'Admin User'
      }
    ];

    res.json({
      success: true,
      data: mockHistory
    });

  } catch (error) {
    console.error('Get notification history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notification history'
    });
  }
});

// @route   GET /api/notifications/stats
// @desc    Get notification statistics
// @access  Admin
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });
    const usersWithNotifications = await User.countDocuments({ 'preferences.notifications': true });

    // Mock email stats (in real app, get from email service or logs)
    const emailStats = {
      totalSent: 1250,
      totalDelivered: 1198,
      totalFailed: 52,
      deliveryRate: 95.8,
      lastWeekSent: 180,
      thisMonthSent: 720
    };

    res.json({
      success: true,
      data: {
        userStats: {
          total: totalUsers,
          active: activeUsers,
          inactive: inactiveUsers,
          withNotifications: usersWithNotifications
        },
        emailStats
      }
    });

  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notification statistics'
    });
  }
});

module.exports = router;
