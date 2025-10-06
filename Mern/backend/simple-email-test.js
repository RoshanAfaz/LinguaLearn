require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('🧪 Simple Email Test...');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

const mailOptions = {
  from: process.env.EMAIL_USER,
  to: 'roshanafazf@gmail.com',
  subject: 'Test Email from LinguaLearn',
  text: 'This is a simple test email to verify your email configuration is working.',
  html: `
    <h2>🎉 Email Test Successful!</h2>
    <p>If you're reading this, your email configuration is working correctly!</p>
    <p><strong>From:</strong> ${process.env.EMAIL_USER}</p>
    <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
  `
};

console.log('📧 Sending simple test email...');
console.log('From:', process.env.EMAIL_USER);
console.log('To:', 'roshanafazf@gmail.com');

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('❌ Email failed:', error);
  } else {
    console.log('✅ Email sent successfully!');
    console.log('📬 Message ID:', info.messageId);
    console.log('📧 Check your email!');
  }
  process.exit(error ? 1 : 0);
});
