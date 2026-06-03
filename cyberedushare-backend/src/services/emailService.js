const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOtpEmail = async (toEmail, otp) => {
  await transporter.sendMail({
    from: `"CyberEduShare+" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Your Email Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; border-radius: 12px; border: 1px solid #e0e0e0;">
        <h2 style="color: #1E1E1E;">Email Verification</h2>
        <p style="color: #555; font-size: 15px;">Use the code below to verify your CyberEduShare+ account. It expires in <strong>10 minutes</strong>.</p>
        <div style="text-align: center; margin: 32px 0;">
          <span style="font-size: 40px; font-weight: bold; letter-spacing: 12px; color: #5B7BFF;">${otp}</span>
        </div>
        <p style="color: #999; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
};

module.exports = { sendOtpEmail };