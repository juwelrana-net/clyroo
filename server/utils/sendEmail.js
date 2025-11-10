// server/utils/sendEmail.js

const sgMail = require("@sendgrid/mail");

// .env file se API key set karein
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, html) => {
  // .env file se bhejne waale ka email lein
  const fromEmail = process.env.SENDGRID_SENDER_EMAIL;

  const msg = {
    to: to, // Paane waala (e.g., customer@gmail.com)
    from: {
      email: fromEmail,
      name: "Clyroo", // Bhejne waale ka naam
    },
    subject: subject, // Subject line
    html: html, // HTML body
  };

  try {
    // Email bhej dein
    await sgMail.send(msg);
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error("Error sending email via SendGrid:");

    // SendGrid ke specific errors ko log karein
    if (error.response) {
      console.error(error.response.body);
    } else {
      console.error(error);
    }
  }
};

module.exports = sendEmail;
