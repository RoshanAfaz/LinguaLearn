const nodemailer = require('nodemailer');

console.log('🧪 Testing with Ethereal Email (Development)...');

// Create Ethereal test account
nodemailer.createTestAccount((err, account) => {
  if (err) {
    console.error('❌ Failed to create test account:', err);
    return;
  }

  console.log('✅ Ethereal test account created');
  console.log('📧 User:', account.user);
  console.log('🔑 Pass:', account.pass);

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    auth: {
      user: account.user,
      pass: account.pass
    }
  });

  // Send test email
  const mailOptions = {
    from: '"LinguaLearn Team" <noreply@lingualearn.com>',
    to: 'roshanafazf@gmail.com',
    subject: '🎉 Welcome to LinguaLearn - Test Email',
    html: `
      <h2>🎉 Welcome to LinguaLearn!</h2>
      <p>This is a test email to verify the email system is working.</p>
      <p><strong>Note:</strong> This is sent via Ethereal Email (testing service)</p>
      <p>In production, this would be sent via Gmail or another real email service.</p>
    `
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('❌ Email failed:', error);
    } else {
      console.log('✅ Email sent successfully!');
      console.log('📬 Message ID:', info.messageId);
      console.log('🔗 Preview URL:', nodemailer.getTestMessageUrl(info));
      console.log('\n💡 Click the preview URL to see the email!');
    }
  });
});
