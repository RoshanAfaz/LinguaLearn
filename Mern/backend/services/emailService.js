const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

class EmailService {
  constructor() {
    this.transporter = this.createTransporter();
    this.templates = {};
    this.loadTemplates();
  }

  createTransporter() {
    // Simple Gmail configuration
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  loadTemplates() {
    const templatesDir = path.join(__dirname, '../templates/emails');
    
    // Create templates directory if it doesn't exist
    if (!fs.existsSync(templatesDir)) {
      fs.mkdirSync(templatesDir, { recursive: true });
    }

    try {
      const templateFiles = ['welcome.hbs', 'achievement.hbs', 'milestone.hbs', 'streak.hbs'];
      
      templateFiles.forEach(file => {
        const templatePath = path.join(templatesDir, file);
        if (fs.existsSync(templatePath)) {
          const templateContent = fs.readFileSync(templatePath, 'utf8');
          const templateName = file.replace('.hbs', '');
          this.templates[templateName] = handlebars.compile(templateContent);
        }
      });
    } catch (error) {
      console.error('Error loading email templates:', error);
    }
  }

  async sendWelcomeEmail(user) {
    try {
      console.log('🚀 Attempting to send welcome email to:', user.email);

      const template = this.templates.welcome || this.getDefaultWelcomeTemplate();

      const html = template({
        userName: user.name,
        userEmail: user.email,
        appName: 'LinguaLearn',
        appUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
        year: new Date().getFullYear()
      });

      const mailOptions = {
        from: `"LinguaLearn Team" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: '🎉 Welcome to LinguaLearn - Start Your Language Journey!',
        html: html
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Welcome email sent successfully to:', user.email);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Error sending welcome email:', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendAchievementEmail(user, achievement) {
    try {
      const template = this.templates.achievement || this.getDefaultAchievementTemplate();
      
      const html = template({
        userName: user.name,
        achievementTitle: achievement.title,
        achievementDescription: achievement.description,
        achievementIcon: achievement.icon || '🏆',
        achievementDate: new Date().toLocaleDateString(),
        appName: 'LinguaLearn',
        appUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
        year: new Date().getFullYear()
      });

      const mailOptions = {
        from: `"LinguaLearn Team" <${process.env.EMAIL_USER || 'noreply@lingualearn.com'}>`,
        to: user.email,
        subject: `🏆 Achievement Unlocked: ${achievement.title}!`,
        html: html
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Achievement email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending achievement email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendMilestoneEmail(user, milestone) {
    try {
      const template = this.templates.milestone || this.getDefaultMilestoneTemplate();
      
      const html = template({
        userName: user.name,
        milestoneType: milestone.type,
        milestoneValue: milestone.value,
        milestoneUnit: milestone.unit,
        milestoneMessage: milestone.message,
        appName: 'LinguaLearn',
        appUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
        year: new Date().getFullYear()
      });

      const mailOptions = {
        from: `"LinguaLearn Team" <${process.env.EMAIL_USER || 'noreply@lingualearn.com'}>`,
        to: user.email,
        subject: `🎯 Milestone Reached: ${milestone.value} ${milestone.unit}!`,
        html: html
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Milestone email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending milestone email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendStreakEmail(user, streakDays) {
    try {
      const template = this.templates.streak || this.getDefaultStreakTemplate();
      
      const html = template({
        userName: user.name,
        streakDays: streakDays,
        streakMessage: this.getStreakMessage(streakDays),
        appName: 'LinguaLearn',
        appUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
        year: new Date().getFullYear()
      });

      const mailOptions = {
        from: `"LinguaLearn Team" <${process.env.EMAIL_USER || 'noreply@lingualearn.com'}>`,
        to: user.email,
        subject: `🔥 ${streakDays} Day Learning Streak - Keep it up!`,
        html: html
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Streak email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending streak email:', error);
      return { success: false, error: error.message };
    }
  }

  getStreakMessage(days) {
    if (days >= 100) return "You're a language learning legend! 🌟";
    if (days >= 50) return "Incredible dedication! You're unstoppable! 💪";
    if (days >= 30) return "Amazing consistency! You're building great habits! 🚀";
    if (days >= 14) return "Two weeks strong! You're on fire! 🔥";
    if (days >= 7) return "One week streak! Great momentum! ⭐";
    return "Keep the streak alive! You're doing great! 💫";
  }

  getDefaultWelcomeTemplate() {
    return handlebars.compile(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to {{appName}}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; color: white; }
          .header h1 { margin: 0; font-size: 32px; font-weight: 700; }
          .header p { margin: 10px 0 0; font-size: 18px; opacity: 0.9; }
          .content { padding: 40px 30px; }
          .welcome-icon { font-size: 64px; text-align: center; margin-bottom: 20px; }
          .message { font-size: 18px; line-height: 1.6; color: #333; margin-bottom: 30px; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; margin: 20px 0; }
          .features { background: #f8f9fa; padding: 30px; border-radius: 15px; margin: 30px 0; }
          .feature { display: flex; align-items: center; margin: 15px 0; }
          .feature-icon { font-size: 24px; margin-right: 15px; }
          .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div style="padding: 40px 20px;">
          <div class="container">
            <div class="header">
              <h1>🌍 Welcome to {{appName}}!</h1>
              <p>Your language learning journey starts here</p>
            </div>
            <div class="content">
              <div class="welcome-icon">🎉</div>
              <div class="message">
                <p>Hi {{userName}},</p>
                <p>Welcome to LinguaLearn! We're thrilled to have you join our community of language learners from around the world.</p>
                <p>Get ready to embark on an exciting journey where you'll master new languages through interactive lessons, games, and real-world conversations.</p>
              </div>
              <div style="text-align: center;">
                <a href="{{appUrl}}" class="cta-button">Start Learning Now 🚀</a>
              </div>
              <div class="features">
                <h3 style="margin-top: 0; color: #333;">What you can do with LinguaLearn:</h3>
                <div class="feature">
                  <span class="feature-icon">📚</span>
                  <span>Interactive flashcards and vocabulary building</span>
                </div>
                <div class="feature">
                  <span class="feature-icon">🎮</span>
                  <span>Fun language games and challenges</span>
                </div>
                <div class="feature">
                  <span class="feature-icon">🤖</span>
                  <span>AI-powered translation and conversation practice</span>
                </div>
                <div class="feature">
                  <span class="feature-icon">📊</span>
                  <span>Track your progress and celebrate achievements</span>
                </div>
              </div>
            </div>
            <div class="footer">
              <p>Happy learning!</p>
              <p>The {{appName}} Team</p>
              <p>© {{year}} {{appName}}. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `);
  }

  getDefaultAchievementTemplate() {
    return handlebars.compile(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Achievement Unlocked!</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 30px; text-align: center; color: white; }
          .achievement-badge { font-size: 80px; margin-bottom: 20px; }
          .content { padding: 40px 30px; text-align: center; }
          .achievement-title { font-size: 28px; font-weight: 700; color: #333; margin-bottom: 15px; }
          .achievement-desc { font-size: 18px; color: #666; line-height: 1.6; margin-bottom: 30px; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; }
          .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div style="padding: 40px 20px;">
          <div class="container">
            <div class="header">
              <div class="achievement-badge">{{achievementIcon}}</div>
              <h1>Achievement Unlocked!</h1>
            </div>
            <div class="content">
              <h2 class="achievement-title">{{achievementTitle}}</h2>
              <p class="achievement-desc">{{achievementDescription}}</p>
              <p>Congratulations {{userName}}! You've reached a new milestone in your language learning journey.</p>
              <a href="{{appUrl}}" class="cta-button">Continue Learning 🚀</a>
            </div>
            <div class="footer">
              <p>Keep up the amazing work!</p>
              <p>The {{appName}} Team</p>
              <p>© {{year}} {{appName}}. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `);
  }

  getDefaultMilestoneTemplate() {
    return handlebars.compile(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Milestone Reached!</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 40px 30px; text-align: center; color: white; }
          .milestone-number { font-size: 72px; font-weight: 700; margin-bottom: 10px; }
          .content { padding: 40px 30px; text-align: center; }
          .milestone-title { font-size: 28px; font-weight: 700; color: #333; margin-bottom: 15px; }
          .milestone-message { font-size: 18px; color: #666; line-height: 1.6; margin-bottom: 30px; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; }
          .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div style="padding: 40px 20px;">
          <div class="container">
            <div class="header">
              <div class="milestone-number">{{milestoneValue}}</div>
              <h1>{{milestoneUnit}} Milestone!</h1>
            </div>
            <div class="content">
              <h2 class="milestone-title">🎯 Incredible Progress, {{userName}}!</h2>
              <p class="milestone-message">{{milestoneMessage}}</p>
              <p>You've reached {{milestoneValue}} {{milestoneUnit}} - that's fantastic dedication to your language learning journey!</p>
              <a href="{{appUrl}}" class="cta-button">Keep Going 💪</a>
            </div>
            <div class="footer">
              <p>Your consistency is inspiring!</p>
              <p>The {{appName}} Team</p>
              <p>© {{year}} {{appName}}. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `);
  }

  getDefaultStreakTemplate() {
    return handlebars.compile(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Streak Achievement!</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 40px 30px; text-align: center; color: white; }
          .streak-flame { font-size: 80px; margin-bottom: 20px; }
          .streak-days { font-size: 48px; font-weight: 700; margin-bottom: 10px; }
          .content { padding: 40px 30px; text-align: center; }
          .streak-message { font-size: 24px; font-weight: 600; color: #333; margin-bottom: 20px; }
          .encouragement { font-size: 18px; color: #666; line-height: 1.6; margin-bottom: 30px; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; }
          .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div style="padding: 40px 20px;">
          <div class="container">
            <div class="header">
              <div class="streak-flame">🔥</div>
              <div class="streak-days">{{streakDays}} Days</div>
              <h1>Learning Streak!</h1>
            </div>
            <div class="content">
              <h2 class="streak-message">{{streakMessage}}</h2>
              <p class="encouragement">Hi {{userName}}, you've been learning consistently for {{streakDays}} days straight! Your dedication is truly inspiring.</p>
              <p>Consistency is the key to mastering any language. Keep up this amazing momentum!</p>
              <a href="{{appUrl}}" class="cta-button">Continue Streak 🚀</a>
            </div>
            <div class="footer">
              <p>Don't break the chain!</p>
              <p>The {{appName}} Team</p>
              <p>© {{year}} {{appName}}. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `);
  }

  async sendCustomEmail(user, emailData) {
    try {
      console.log('📧 Sending custom email to:', user.email);

      const template = this.getCustomEmailTemplate();

      const html = template({
        userName: user.name,
        subject: emailData.subject,
        message: emailData.message,
        emailType: emailData.type || 'announcement',
        appName: 'LinguaLearn',
        appUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
        year: new Date().getFullYear()
      });

      const mailOptions = {
        from: `"LinguaLearn Team" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: emailData.subject,
        html: html
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Custom email sent successfully to:', user.email);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Error sending custom email:', error.message);
      return { success: false, error: error.message };
    }
  }

  getCustomEmailTemplate() {
    return handlebars.compile(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{{subject}}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; color: white; }
          .content { padding: 40px 30px; }
          .message { font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 30px; white-space: pre-line; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: 600; }
          .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #666; font-size: 14px; }
          .email-type { display: inline-block; background: rgba(102, 126, 234, 0.1); color: #667eea; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div style="padding: 40px 20px;">
          <div class="container">
            <div class="header">
              <h1>📢 {{subject}}</h1>
              <p>Message from the {{appName}} Team</p>
            </div>
            <div class="content">
              <div class="email-type">{{emailType}}</div>
              <p><strong>Hi {{userName}},</strong></p>
              <div class="message">{{message}}</div>
              <div style="text-align: center;">
                <a href="{{appUrl}}" class="cta-button">Visit {{appName}} 🚀</a>
              </div>
            </div>
            <div class="footer">
              <p>Best regards,</p>
              <p>The {{appName}} Team</p>
              <p>© {{year}} {{appName}}. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `);
  }
}

module.exports = new EmailService();
