const twilio = require("twilio");

// Initialize Twilio client
const getTwilioClient = () => {
  return twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
};

// Send SMS OTP for phone verification
const sendPhoneVerificationOTP = async (phoneNumber, otp) => {
  try {
    const client = getTwilioClient();
    
    const message = await client.messages.create({
      body: `Your SkillSwap verification code is: ${otp}. This code expires in 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
    
    return { success: true, messageId: message.sid };
  } catch (error) {
    console.error("SMS sending error:", error);
    return { success: false, error: error.message };
  }
};

// Send session reminder SMS
const sendSessionReminderSMS = async (phoneNumber, sessionDetails) => {
  try {
    const client = getTwilioClient();
    
    const message = await client.messages.create({
      body: `SkillSwap: Reminder - You have a session for "${sessionDetails.skillName}" on ${new Date(sessionDetails.startDate).toLocaleString()} with ${sessionDetails.partnerName}.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
    
    return { success: true, messageId: message.sid };
  } catch (error) {
    console.error("SMS sending error:", error);
    return { success: false, error: error.message };
  }
};

// Send notification SMS
const sendNotificationSMS = async (phoneNumber, messageText) => {
  try {
    const client = getTwilioClient();
    
    const message = await client.messages.create({
      body: `SkillSwap: ${messageText}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
    
    return { success: true, messageId: message.sid };
  } catch (error) {
    console.error("SMS sending error:", error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendPhoneVerificationOTP,
  sendSessionReminderSMS,
  sendNotificationSMS,
};
