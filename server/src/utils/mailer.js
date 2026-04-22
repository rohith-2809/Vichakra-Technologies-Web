const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create a transporter using SMTP
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtpout.secureserver.net',
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465,
    secure: process.env.SMTP_PORT == 587 ? false : true, // false for 587 (TLS), true for 465 (SSL)
    auth: {
      user: process.env.EMAIL_MESSAGE,
      pass: process.env.EMAIL_MESSAGE_PASS,
    },
  });

  const message = {
    from: `${process.env.FROM_NAME || 'Vichakra Technologies'} <${process.env.EMAIL_MESSAGE}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html, // Optional HTML support
  };

  const info = await transporter.sendMail(message);
  console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;
