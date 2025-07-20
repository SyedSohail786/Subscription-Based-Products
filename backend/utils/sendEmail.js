const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `Digital Store <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${to}`);
  } catch (err) {
    console.error("❌ Email Error:", err.message);
  }
};

module.exports = sendEmail;
