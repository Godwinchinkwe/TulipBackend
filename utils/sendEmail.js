const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  // service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587, // use 465 only if 587 is blocked
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
    tls: {
    rejectUnauthorized: false, // bypass strict TLS verification
  },
});

/**
 * sendMail - sends an email
 * @param {Object} options - { to, subject, text, html, attachments }
 */
const sendMail = async (options) => {
  const mailOptions = {
    from: `"Airport Golden Tulip Hotel" <${process.env.EMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
    attachments: options.attachments || []
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendMail;
