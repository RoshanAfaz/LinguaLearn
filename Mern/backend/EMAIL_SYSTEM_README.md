# 📧 LinguaLearn Email System

## Overview
The LinguaLearn email system sends beautiful, responsive HTML emails for user registration, achievements, milestones, and learning streaks.

## Features

### 🎉 Welcome Emails
- Sent automatically when users register
- Beautiful gradient design with app branding
- Feature highlights and getting started guide
- Statistics showcase (50+ languages, 10K+ learners)

### 🏆 Achievement Emails
- Triggered when users unlock achievements
- Animated achievement badges
- Celebration themes with confetti colors
- Achievement details and encouragement

### 🎯 Milestone Emails
- Sent for significant learning milestones
- Progress celebration (words learned, sessions completed)
- Motivational messages
- Clean, professional design

### 🔥 Streak Emails
- Learning streak celebrations (7, 14, 30, 50, 100 days)
- Fire emoji theme with streak counters
- Motivational messages based on streak length
- Encouragement to continue

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
node install-email-deps.js
# OR manually:
npm install nodemailer handlebars
```

### 2. Configure Email Service
Update your `.env` file:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM_NAME=LinguaLearn Team
EMAIL_FROM_ADDRESS=noreply@lingualearn.com
```

### 3. Gmail Setup (Recommended)
1. Enable 2-factor authentication on your Gmail account
2. Go to Google Account settings > Security > App passwords
3. Generate a new app password for "Mail"
4. Use this app password in `EMAIL_PASS` (not your regular password)

### 4. Alternative Email Services
You can configure other SMTP services by modifying `emailService.js`:
```javascript
// For Outlook/Hotmail
service: 'hotmail'

// For Yahoo
service: 'yahoo'

// For custom SMTP
host: 'smtp.yourdomain.com',
port: 587,
secure: false
```

## API Endpoints

### Test Emails (Admin Only)
```
POST /api/email/test-welcome
POST /api/email/test-achievement
POST /api/email/test-streak
POST /api/email/test-milestone
```

### User Achievements
```
GET /api/progress/achievements
POST /api/progress/check-achievements
POST /api/email/send-achievement
```

## Achievement System

### Available Achievements
1. **First Steps** 🎯 - Complete first learning session
2. **Week Warrior** 🔥 - 7-day learning streak
3. **Monthly Master** 🏆 - 30-day learning streak
4. **Vocabulary Builder** 📚 - Learn 100 words
5. **Word Master** 🌟 - Learn 500 words
6. **Perfectionist** 💯 - 100% accuracy in a session
7. **Speed Demon** ⚡ - Complete 50 words in under 5 minutes
8. **Dedicated Learner** 🎓 - Complete 50 sessions
9. **Polyglot** 🌍 - Study 3 different languages
10. **Night Owl** 🦉 - Learn after 10 PM
11. **Early Bird** 🐦 - Learn before 7 AM

### Milestone Triggers
- **Words Learned**: 50, 100, 250, 500, 1000
- **Sessions Completed**: 10, 25, 50, 100, 200
- **Study Time**: 60, 300, 600, 1200 minutes

### Streak Celebrations
- **7 days**: "One week streak! Great momentum! ⭐"
- **14 days**: "Two weeks strong! You're on fire! 🔥"
- **30 days**: "Amazing consistency! You're building great habits! 🚀"
- **50 days**: "Incredible dedication! You're unstoppable! 💪"
- **100+ days**: "You're a language learning legend! 🌟"

## Email Templates

### Template Structure
```
backend/templates/emails/
├── welcome.hbs          # Welcome email template
├── achievement.hbs      # Achievement email template
├── milestone.hbs        # Milestone email template
└── streak.hbs          # Streak email template
```

### Template Variables
**Welcome Email:**
- `{{userName}}` - User's name
- `{{userEmail}}` - User's email
- `{{appName}}` - Application name
- `{{appUrl}}` - Frontend URL
- `{{year}}` - Current year

**Achievement Email:**
- `{{userName}}` - User's name
- `{{achievementTitle}}` - Achievement title
- `{{achievementDescription}}` - Achievement description
- `{{achievementIcon}}` - Achievement emoji
- `{{achievementDate}}` - Date achieved

**Milestone Email:**
- `{{userName}}` - User's name
- `{{milestoneType}}` - Type of milestone
- `{{milestoneValue}}` - Milestone value
- `{{milestoneUnit}}` - Unit (words, sessions, etc.)
- `{{milestoneMessage}}` - Custom message

**Streak Email:**
- `{{userName}}` - User's name
- `{{streakDays}}` - Number of streak days
- `{{streakMessage}}` - Motivational message

## Testing

### Manual Testing
1. Register a new user → Should receive welcome email
2. Complete learning sessions → Should trigger achievements
3. Use admin panel to test specific emails

### API Testing
```bash
# Test welcome email
curl -X POST http://localhost:5000/api/email/test-welcome \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"email": "test@example.com", "name": "Test User"}'

# Test achievement email
curl -X POST http://localhost:5000/api/email/test-achievement \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"email": "test@example.com", "name": "Test User"}'
```

## Troubleshooting

### Common Issues

1. **"Invalid login" error**
   - Make sure you're using an app password, not your regular password
   - Enable 2-factor authentication first

2. **Emails not sending**
   - Check your email credentials in `.env`
   - Verify SMTP settings for your email provider
   - Check server logs for detailed error messages

3. **Emails going to spam**
   - Use a proper "from" address
   - Consider using a dedicated email service (SendGrid, Mailgun)
   - Add SPF/DKIM records to your domain

4. **Template not loading**
   - Ensure template files exist in `backend/templates/emails/`
   - Check file permissions
   - Verify Handlebars syntax

### Debug Mode
Enable detailed logging by setting:
```env
NODE_ENV=development
```

## Production Considerations

### Email Service Providers
For production, consider using:
- **SendGrid** - Reliable, good free tier
- **Mailgun** - Developer-friendly
- **Amazon SES** - Cost-effective for high volume
- **Postmark** - Excellent deliverability

### Security
- Use environment variables for all credentials
- Never commit email passwords to version control
- Use app passwords instead of regular passwords
- Consider OAuth2 for Gmail integration

### Performance
- Email sending is asynchronous (doesn't block user registration)
- Failed emails are logged but don't affect user experience
- Consider implementing email queues for high volume

## Customization

### Adding New Email Types
1. Create new template in `backend/templates/emails/`
2. Add method to `emailService.js`
3. Add trigger logic in appropriate route
4. Test with admin endpoints

### Styling
- Templates use inline CSS for maximum compatibility
- Responsive design with mobile-first approach
- Gradient backgrounds and modern design elements
- Emoji icons for visual appeal

### Branding
- Update colors in template CSS
- Replace logo/branding elements
- Customize footer information
- Modify email copy and tone

## Support
For issues or questions about the email system:
1. Check server logs for error details
2. Verify email service configuration
3. Test with admin endpoints
4. Review this documentation

Happy emailing! 📧✨
