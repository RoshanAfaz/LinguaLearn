require('dotenv').config();
const emailService = require('./services/emailService');

console.log('🧪 Testing Notification System...');

const testUser = {
  name: 'Test User',
  email: 'roshanafazf@gmail.com'
};

async function testNotifications() {
  console.log('\n📧 Testing custom notification email...');
  
  try {
    const result = await emailService.sendCustomEmail(testUser, {
      subject: 'Test Notification from LinguaLearn Admin',
      message: `Hello ${testUser.name}!\n\nThis is a test notification from the LinguaLearn admin panel.\n\nWe're testing our new notification system to make sure everything works perfectly.\n\nBest regards,\nThe LinguaLearn Team`,
      type: 'announcement'
    });

    if (result.success) {
      console.log('✅ Custom notification email sent successfully!');
      console.log('📬 Message ID:', result.messageId);
      console.log('\n📧 Check your email for the notification!');
    } else {
      console.log('❌ Failed to send notification email:', result.error);
    }

  } catch (error) {
    console.error('❌ Error testing notifications:', error);
  }

  console.log('\n🏆 Testing achievement email...');
  
  try {
    const testAchievement = {
      title: 'Admin Panel Master',
      description: 'Successfully tested the notification system from the admin panel',
      icon: '🎯'
    };

    const result = await emailService.sendAchievementEmail(testUser, testAchievement);

    if (result.success) {
      console.log('✅ Achievement email sent successfully!');
      console.log('📬 Message ID:', result.messageId);
    } else {
      console.log('❌ Failed to send achievement email:', result.error);
    }

  } catch (error) {
    console.error('❌ Error testing achievement email:', error);
  }

  console.log('\n🎯 All notification tests completed!');
  console.log('📧 Check your Gmail for the test emails.');
  process.exit(0);
}

testNotifications();
