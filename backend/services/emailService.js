const nodemailer = require("nodemailer");

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Send verification email
const sendVerificationEmail = async (email, otp) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "SkillSwap - Email Verification",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Welcome to SkillSwap!</h2>
          <p>Thank you for registering. Please verify your email address using the OTP below:</p>
          <div style="background: #F3F4F6; padding: 20px; text-align: center; border-radius: 8px;">
            <h1 style="color: #4F46E5; font-size: 36px; margin: 0;">${otp}</h1>
          </div>
          <p style="color: #6B7280; font-size: 14px;">This OTP will expire in 10 minutes.</p>
          <p style="color: #6B7280; font-size: 14px;">If you didn't create an account, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Email sending error:", error);
    return { success: false, error: error.message };
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, otp) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "SkillSwap - Password Reset",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">SkillSwap Password Reset</h2>
          <p>You requested a password reset. Use the OTP below:</p>
          <div style="background: #F3F4F6; padding: 20px; text-align: center; border-radius: 8px;">
            <h1 style="color: #4F46E5; font-size: 36px; margin: 0;">${otp}</h1>
          </div>
          <p style="color: #6B7280; font-size: 14px;">This OTP will expire in 10 minutes.</p>
          <p style="color: #6B7280; font-size: 14px;">If you didn't request a password reset, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Email sending error:", error);
    return { success: false, error: error.message };
  }
};

// Send session reminder email
const sendSessionReminderEmail = async (email, sessionDetails) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "SkillSwap - Session Reminder",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Session Reminder</h2>
          <p>You have an upcoming session:</p>
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px;">
            <p><strong>Skill:</strong> ${sessionDetails.skillName}</p>
            <p><strong>Date:</strong> ${new Date(sessionDetails.startDate).toLocaleString()}</p>
            <p><strong>With:</strong> ${sessionDetails.partnerName}</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Email sending error:", error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendSessionReminderEmail,
};
