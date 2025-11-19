// backend/notifications/smsService.js
/**
 * SMS Service
 * - In production: integrate Twilio, MSG91, Nexmo, etc.
 * - Currently: console log for demo
 */

export const sendSMS = async (phone, message) => {
  try {
    // Dummy log (replace with Twilio client.sendMessage)
    console.log(`📱 SMS sent to ${phone}: ${message}`);
    return true;
  } catch (err) {
    console.error(" SMS sending failed:", err.message);
    throw new Error("Failed to send SMS");
  }
};
