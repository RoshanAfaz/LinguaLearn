const express = require('express');
const emailService = require('../services/localEmailService');
const { auth, adminAuth } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// @route   POST /api/email/test-welcome
// @desc    Test welcome email (Admin only)
// @access  Admin
router.post('/test-welcome', auth, adminAuth, async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email and name are required'
      });
    }

    const testUser = { email, name };
    const result = await emailService.sendWelcomeEmail(testUser);

    res.json({
      success: true,
      message: 'Test welcome email sent successfully',
      result
    });
  } catch (error) {
    console.error('Test welcome email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message
    });
  }
});

// @route   POST /api/email/test-achievement
// @desc    Test achievement email (Admin only)
// @access  Admin
router.post('/test-achievement', auth, adminAuth, async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email and name are required'
      });
    }

    const testUser = { email, name };
    const testAchievement = {
      title: 'Test Achievement',
      description: 'This is a test achievement to verify email functionality',
      icon: '🏆'
    };

    const result = await emailService.sendAchievementEmail(testUser, testAchievement);

    res.json({
      success: true,
      message: 'Test achievement email sent successfully',
      result
    });
  } catch (error) {
    console.error('Test achievement email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message
    });
  }
});

// @route   POST /api/email/test-streak
// @desc    Test streak email (Admin only)
// @access  Admin
router.post('/test-streak', auth, adminAuth, async (req, res) => {
  try {
    const { email, name, streakDays = 7 } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email and name are required'
      });
    }

    const testUser = { email, name };
    const result = await emailService.sendStreakEmail(testUser, streakDays);

    res.json({
      success: true,
      message: 'Test streak email sent successfully',
      result
    });
  } catch (error) {
    console.error('Test streak email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message
    });
  }
});

// @route   POST /api/email/test-milestone
// @desc    Test milestone email (Admin only)
// @access  Admin
router.post('/test-milestone', auth, adminAuth, async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email and name are required'
      });
    }

    const testUser = { email, name };
    const testMilestone = {
      type: 'Words Learned',
      value: 100,
      unit: 'Words',
      message: 'You\'ve mastered 100 words! Your vocabulary is growing stronger every day.'
    };

    const result = await emailService.sendMilestoneEmail(testUser, testMilestone);

    res.json({
      success: true,
      message: 'Test milestone email sent successfully',
      result
    });
  } catch (error) {
    console.error('Test milestone email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message
    });
  }
});

// @route   POST /api/email/send-achievement
// @desc    Send achievement email to user
// @access  Private
router.post('/send-achievement', auth, async (req, res) => {
  try {
    const { achievementId } = req.body;
    
    if (!achievementId) {
      return res.status(400).json({
        success: false,
        message: 'Achievement ID is required'
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const achievement = user.achievements.find(a => a.id === achievementId);
    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found'
      });
    }

    const result = await emailService.sendAchievementEmail(user, achievement);

    res.json({
      success: true,
      message: 'Achievement email sent successfully',
      result
    });
  } catch (error) {
    console.error('Send achievement email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send achievement email',
      error: error.message
    });
  }
});

// @route   GET /api/email/preview/:filename
// @desc    Preview email in browser
// @access  Public (for development)
router.get('/preview/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const emailContent = emailService.getEmailContent(filename);

    if (!emailContent) {
      return res.status(404).send(`
        <h1>Email Not Found</h1>
        <p>The email file "${filename}" was not found.</p>
        <a href="/api/email/list">View All Emails</a>
      `);
    }

    res.setHeader('Content-Type', 'text/html');
    res.send(emailContent);
  } catch (error) {
    console.error('Email preview error:', error);
    res.status(500).send('<h1>Error loading email</h1>');
  }
});

// @route   GET /api/email/list
// @desc    List all saved emails
// @access  Public (for development)
router.get('/list', (req, res) => {
  try {
    const emails = emailService.getAllEmails();

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>LinguaLearn - Email List</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
          .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; }
          .email-item { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; background: #f9f9f9; }
          .email-subject { font-weight: bold; color: #333; margin-bottom: 5px; }
          .email-meta { color: #666; font-size: 14px; margin-bottom: 10px; }
          .email-link { display: inline-block; background: #007bff; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; }
          .email-link:hover { background: #0056b3; }
          .no-emails { text-align: center; color: #666; padding: 40px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📧 LinguaLearn Email List</h1>
            <p>Development Email System - All sent emails</p>
          </div>
          ${emails.length === 0 ?
            '<div class="no-emails">No emails sent yet. Register a user to see welcome emails!</div>' :
            emails.map(email => `
              <div class="email-item">
                <div class="email-subject">${email.subject}</div>
                <div class="email-meta">
                  To: ${email.to} | Type: ${email.type} | Sent: ${new Date(email.timestamp).toLocaleString()}
                </div>
                <a href="/api/email/preview/${email.filename}" class="email-link" target="_blank">View Email</a>
              </div>
            `).join('')
          }
        </div>
      </body>
      </html>
    `;

    res.send(html);
  } catch (error) {
    console.error('Email list error:', error);
    res.status(500).send('<h1>Error loading email list</h1>');
  }
});

module.exports = router;
