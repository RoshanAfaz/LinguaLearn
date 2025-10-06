// Simple script to install email dependencies
const { execSync } = require('child_process');

console.log('Installing email dependencies...');

try {
  // Install nodemailer and handlebars
  execSync('npm install nodemailer@6.9.7 handlebars@4.7.8', { stdio: 'inherit' });
  console.log('✅ Email dependencies installed successfully!');
  
  console.log('\n📧 Email Setup Instructions:');
  console.log('1. Update your .env file with email credentials:');
  console.log('   EMAIL_USER=your-email@gmail.com');
  console.log('   EMAIL_PASS=your-app-password');
  console.log('');
  console.log('2. For Gmail:');
  console.log('   - Enable 2-factor authentication');
  console.log('   - Generate an app password');
  console.log('   - Use the app password (not your regular password)');
  console.log('');
  console.log('3. Test emails using the admin panel or API endpoints');
  
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  console.log('\n🔧 Manual installation:');
  console.log('Run: npm install nodemailer handlebars');
}
