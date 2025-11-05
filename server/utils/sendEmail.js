// server/utils/sendEmail.js

const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html) => {
  // 1. Ek "transporter" create karein (Email service setup)
  // Hum Gmail istemal kar rahe hain.
  // IMPORTANT: Aapko Gmail account mein "App Password" generate karna hoga.
  // https://support.google.com/accounts/answer/185833
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // Aapki .env file se
      pass: process.env.EMAIL_PASS, // Aapki .env file se (App Password)
    },
  });

  // 2. Email options define karein
  const mailOptions = {
    from: `"Clyroo" <${process.env.EMAIL_USER}>`, // Bhejne wale ka naam aur email
    to: to, // Paane wale ka email
    subject: subject, // Subject line
    html: html, // HTML body
  };

  // 3. Email bhej dein
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully: " + info.response);
  } catch (error) {
    console.error("Error sending email: ", error);
  }
};

module.exports = sendEmail;
