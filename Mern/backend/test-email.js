require('dotenv').config();
const emailService = require('./services/emailService');

console.log('🧪 Testing Email Configuration...');
console.log('📧 Email User:', process.env.EMAIL_USER);
console.log('🔑 Has Password:', !!process.env.EMAIL_PASS);
console.log('🌐 Frontend URL:', process.env.FRONTEND_URL);

const testUser = {
  name: 'Test User',
  email: 'roshanafazf@gmail.com' // Your email
};

console.log('\n🚀 Sending test welcome email...');

emailService.sendWelcomeEmail(testUser)
  .then(result => {
    console.log('\n✅ Email test completed successfully!');
    console.log('📬 Result:', result);
    console.log('\n📧 Check your email (roshanafazf@gmail.com) for the welcome message!');
    console.log('📁 Also check your spam folder if you don\'t see it in inbox.');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Email test failed!');
    console.error('🔍 Error details:', error);
    
    // Common troubleshooting tips
    console.log('\n🔧 Troubleshooting Tips:');
    console.log('1. Make sure 2-factor authentication is enabled on your Gmail');
    console.log('2. Use an app password, not your regular Gmail password');
    console.log('3. Check if "Less secure app access" is enabled (if not using app password)');
    console.log('4. Verify your email credentials in the .env file');
    
    process.exit(1);
  });
