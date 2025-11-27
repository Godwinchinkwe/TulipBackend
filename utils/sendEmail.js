const Brevo = require('@getbrevo/brevo');

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

/**
 * sendMail - sends an email through Brevo
 * @param {Object} options - { to, subject, text, html, attachments }
 */
const sendMail = async (options) => {
  try {
    const emailData = {
      sender: {
        name: "Airport Golden Tulip Hotel",
        email: process.env.HOTEL_EMAIL, // sending email
      },
      to: [{ email: options.to }],
      subject: options.subject,
      htmlContent: options.html || "",
      textContent: options.text || "",
    };

    // Handle file attachments (Brevo requires base64)
    if (options.attachments && options.attachments.length > 0) {
      const fs = require('fs');

      emailData.attachment = options.attachments.map((file) => ({
        name: file.filename,
        content: fs.readFileSync(file.path).toString("base64"),
      }));
    }

    await apiInstance.sendTransacEmail(emailData);
    console.log("Brevo: Email sent to", options.to);

  } catch (error) {
    console.error("Brevo Email Error:", error.message);
    if (error?.response?.body) console.error(error.response.body);
  }
};

module.exports = sendMail;