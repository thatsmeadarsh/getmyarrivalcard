const nodemailer = require('nodemailer');

// Create a transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send an email
const sendEmail = async (to, subject, text, html = null) => {
  try {
    // For development, log instead of actually sending
    if (process.env.NODE_ENV === 'development') {
      console.log('Email would be sent:');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Text: ${text}`);
      return;
    }
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html: html || text
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error('Error sending email:', err);
    throw err;
  }
};

module.exports = {
  sendEmail
};