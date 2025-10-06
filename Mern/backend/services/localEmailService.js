const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

class LocalEmailService {
  constructor() {
    this.emailsDir = path.join(__dirname, '../emails');
    this.templates = {};
    this.ensureEmailsDirectory();
    this.loadTemplates();
  }

  ensureEmailsDirectory() {
    if (!fs.existsSync(this.emailsDir)) {
      fs.mkdirSync(this.emailsDir, { recursive: true });
      console.log('📁 Created emails directory:', this.emailsDir);
    }
  }

  loadTemplates() {
    const templatesDir = path.join(__dirname, '../templates/emails');
    
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

  async saveEmail(emailData) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${emailData.type}_${timestamp}.html`;
      const filepath = path.join(this.emailsDir, filename);
      
      const emailHtml = this.generateEmailHtml(emailData);
      
      fs.writeFileSync(filepath, emailHtml, 'utf8');
      
      const emailInfo = {
        id: timestamp,
        filename: filename,
        filepath: filepath,
        to: emailData.to,
        subject: emailData.subject,
        type: emailData.type,
        timestamp: new Date().toISOString(),
        previewUrl: `http://localhost:5000/api/email/preview/${filename}`
      };

      // Save email metadata
      const metadataFile = path.join(this.emailsDir, 'emails.json');
      let emails = [];
      
      if (fs.existsSync(metadataFile)) {
        try {
          emails = JSON.parse(fs.readFileSync(metadataFile, 'utf8'));
        } catch (e) {
          emails = [];
        }
      }
      
      emails.unshift(emailInfo); // Add to beginning
      emails = emails.slice(0, 100); // Keep only last 100 emails
      
      fs.writeFileSync(metadataFile, JSON.stringify(emails, null, 2));
      
      return emailInfo;
    } catch (error) {
      console.error('Error saving email:', error);
      throw error;
    }
  }

  generateEmailHtml(emailData) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${emailData.subject}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
    .email-container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .email-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
    .email-meta { background: #f8f9fa; padding: 15px; border-bottom: 1px solid #dee2e6; }
    .email-content { padding: 0; }
    .meta-item { margin: 5px 0; }
    .meta-label { font-weight: bold; color: #495057; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>📧 Local Email Preview</h1>
      <p>LinguaLearn Development Email System</p>
    </div>
    <div class="email-meta">
      <div class="meta-item"><span class="meta-label">To:</span> ${emailData.to}</div>
      <div class="meta-item"><span class="meta-label">Subject:</span> ${emailData.subject}</div>
      <div class="meta-item"><span class="meta-label">Type:</span> ${emailData.type}</div>
      <div class="meta-item"><span class="meta-label">Sent:</span> ${new Date().toLocaleString()}</div>
    </div>
    <div class="email-content">
      ${emailData.html}
    </div>
  </div>
</body>
</html>`;
  }

  async sendWelcomeEmail(user) {
    try {
      console.log('🚀 Sending welcome email locally to:', user.email);
      
      const template = this.templates.welcome || this.getDefaultWelcomeTemplate();
      
      const html = template({
        userName: user.name,
        userEmail: user.email,
        appName: 'LinguaLearn',
        appUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
        year: new Date().getFullYear()
      });

      const emailData = {
        to: user.email,
        subject: '🎉 Welcome to LinguaLearn - Start Your Language Journey!',
        type: 'welcome',
        html: html
      };

      const emailInfo = await this.saveEmail(emailData);
      
      console.log('✅ Welcome email saved locally!');
      console.log('🔗 Preview URL:', emailInfo.previewUrl);
      console.log('👆 Open this URL in your browser to see the email!');
      
      return { 
        success: true, 
        messageId: emailInfo.id,
        previewUrl: emailInfo.previewUrl,
        localFile: emailInfo.filename
      };
    } catch (error) {
      console.error('❌ Error sending welcome email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendAchievementEmail(user, achievement) {
    try {
      console.log('🏆 Sending achievement email locally to:', user.email);
      
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

      const emailData = {
        to: user.email,
        subject: `🏆 Achievement Unlocked: ${achievement.title}!`,
        type: 'achievement',
        html: html
      };

      const emailInfo = await this.saveEmail(emailData);
      
      console.log('✅ Achievement email saved locally!');
      console.log('🔗 Preview URL:', emailInfo.previewUrl);
      
      return { 
        success: true, 
        messageId: emailInfo.id,
        previewUrl: emailInfo.previewUrl
      };
    } catch (error) {
      console.error('❌ Error sending achievement email:', error);
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

      const emailData = {
        to: user.email,
        subject: `🎯 Milestone Reached: ${milestone.value} ${milestone.unit}!`,
        type: 'milestone',
        html: html
      };

      const emailInfo = await this.saveEmail(emailData);
      console.log('✅ Milestone email saved locally!');
      console.log('🔗 Preview URL:', emailInfo.previewUrl);
      
      return { success: true, messageId: emailInfo.id, previewUrl: emailInfo.previewUrl };
    } catch (error) {
      console.error('❌ Error sending milestone email:', error);
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

      const emailData = {
        to: user.email,
        subject: `🔥 ${streakDays} Day Learning Streak - Keep it up!`,
        type: 'streak',
        html: html
      };

      const emailInfo = await this.saveEmail(emailData);
      console.log('✅ Streak email saved locally!');
      console.log('🔗 Preview URL:', emailInfo.previewUrl);
      
      return { success: true, messageId: emailInfo.id, previewUrl: emailInfo.previewUrl };
    } catch (error) {
      console.error('❌ Error sending streak email:', error);
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

  getAllEmails() {
    const metadataFile = path.join(this.emailsDir, 'emails.json');
    if (fs.existsSync(metadataFile)) {
      try {
        return JSON.parse(fs.readFileSync(metadataFile, 'utf8'));
      } catch (e) {
        return [];
      }
    }
    return [];
  }

  getEmailContent(filename) {
    const filepath = path.join(this.emailsDir, filename);
    if (fs.existsSync(filepath)) {
      return fs.readFileSync(filepath, 'utf8');
    }
    return null;
  }

  // Default templates (same as original emailService)
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
          .content { padding: 40px 30px; }
          .welcome-icon { font-size: 64px; text-align: center; margin-bottom: 20px; }
          .message { font-size: 18px; line-height: 1.6; color: #333; margin-bottom: 30px; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: 600; }
          .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #666; }
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
                <p>Hi <strong>{{userName}}</strong>,</p>
                <p>Welcome to LinguaLearn! We're thrilled to have you join our community of language learners.</p>
                <p>Get ready to master new languages through interactive lessons, games, and conversations!</p>
              </div>
              <div style="text-align: center;">
                <a href="{{appUrl}}" class="cta-button">Start Learning Now 🚀</a>
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
        <title>Achievement Unlocked!</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 30px; text-align: center; color: white; }
          .achievement-badge { font-size: 80px; margin-bottom: 20px; }
          .content { padding: 40px 30px; text-align: center; }
          .achievement-title { font-size: 28px; font-weight: 700; color: #333; margin-bottom: 15px; }
          .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #666; }
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
              <p>{{achievementDescription}}</p>
              <p>Congratulations {{userName}}! You've reached a new milestone!</p>
            </div>
            <div class="footer">
              <p>Keep up the amazing work!</p>
              <p>The LinguaLearn Team</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `);
  }

  getDefaultMilestoneTemplate() {
    return handlebars.compile(`<h2>🎯 Milestone Reached!</h2><p>{{userName}}, you've reached {{milestoneValue}} {{milestoneUnit}}!</p>`);
  }

  getDefaultStreakTemplate() {
    return handlebars.compile(`<h2>🔥 {{streakDays}} Day Streak!</h2><p>{{userName}}, {{streakMessage}}</p>`);
  }
}

module.exports = new LocalEmailService();
