const brevo = require('@getbrevo/brevo');

const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

exports.sendEmail = async ({ to, subject, htmlContent }) => {
  try {
    await apiInstance.sendTransacEmail({
      sender: { name: "Golden Tulip Airport Hotel", email: process.env.HOTEL_EMAIL },
      to: [{ email: to }],
      subject,
      htmlContent,
    });

    console.log("Email sent successfully to:", to);
  } catch (error) {
    console.error("Brevo Email Error:", error.message);
    if (error.response) console.error(error.response.body);
  }
};
