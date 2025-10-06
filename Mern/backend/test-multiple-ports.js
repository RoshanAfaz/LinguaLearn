require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('🧪 Testing Multiple SMTP Configurations...');

const configurations = [
  {
    name: 'Gmail Port 587 (STARTTLS)',
    config: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    }
  },
  {
    name: 'Gmail Port 465 (SSL)',
    config: {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    }
  },
  {
    name: 'Gmail Service (Auto)',
    config: {
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    }
  }
];

async function testConfiguration(config, name) {
  return new Promise((resolve) => {
    console.log(`\n🔍 Testing: ${name}`);
    
    const transporter = nodemailer.createTransporter(config);
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'roshanafazf@gmail.com',
      subject: `Test Email - ${name}`,
      text: `This is a test email using ${name} configuration.`,
      html: `<h3>✅ Success!</h3><p>This email was sent using: <strong>${name}</strong></p>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(`❌ ${name} failed:`, error.message);
        resolve({ success: false, error: error.message, config: name });
      } else {
        console.log(`✅ ${name} succeeded!`);
        console.log(`📬 Message ID: ${info.messageId}`);
        resolve({ success: true, messageId: info.messageId, config: name });
      }
    });
  });
}

async function testAllConfigurations() {
  console.log('📧 Email User:', process.env.EMAIL_USER);
  console.log('🔑 Has Password:', !!process.env.EMAIL_PASS);
  
  for (const { config, name } of configurations) {
    const result = await testConfiguration(config, name);
    
    if (result.success) {
      console.log(`\n🎉 SUCCESS! ${name} is working!`);
      console.log('📧 Check your email for the test message.');
      console.log(`\n💡 Use this configuration in your emailService.js`);
      process.exit(0);
    }
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n❌ All configurations failed.');
  console.log('\n🔧 Possible solutions:');
  console.log('1. Check your firewall settings');
  console.log('2. Try from a different network');
  console.log('3. Contact your ISP about SMTP blocking');
  console.log('4. Use a different email service (SendGrid, Mailgun)');
  
  process.exit(1);
}

testAllConfigurations();
