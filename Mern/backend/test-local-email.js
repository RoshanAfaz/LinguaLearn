const localEmailService = require('./services/localEmailService');

console.log('🧪 Testing Local Email Service...');
console.log('📁 No SMTP required - emails saved locally!');

const testUser = {
  name: 'Test User',
  email: 'roshanafazf@gmail.com'
};

console.log('\n🚀 Sending test welcome email...');

localEmailService.sendWelcomeEmail(testUser)
  .then(result => {
    console.log('\n✅ Local email test completed successfully!');
    console.log('📬 Result:', result);
    console.log('\n📧 Email saved locally and ready to view!');
    console.log('🔗 Preview URL:', result.previewUrl);
    console.log('📋 Email List: http://localhost:5000/api/email/list');
    console.log('\n🎯 Next steps:');
    console.log('1. Start your server: node server.js');
    console.log('2. Open the preview URL in your browser');
    console.log('3. Register a new user to test automatic emails');
    
    // Test achievement email too
    console.log('\n🏆 Testing achievement email...');
    const testAchievement = {
      title: 'First Steps',
      description: 'Completed your first learning session',
      icon: '🎯'
    };
    
    return localEmailService.sendAchievementEmail(testUser, testAchievement);
  })
  .then(result => {
    console.log('✅ Achievement email test completed!');
    console.log('🔗 Achievement Preview:', result.previewUrl);
    
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Local email test failed!');
    console.error('🔍 Error details:', error);
    process.exit(1);
  });
