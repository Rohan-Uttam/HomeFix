import twilio from "twilio";
import env from "../config/env.js";

const client = twilio(env.twilio.sid, env.twilio.authToken);

export const sendSMS = async (to, body) => {
  try {
    const formattedTo = to.startsWith("+") ? to : `+91${to}`;
    const message = await client.messages.create({
      body,
      from: env.twilio.from,
      to: formattedTo,
    });
    console.log("SMS sent:", message.sid);
    return true;
  } catch (err) {
    console.error(" SMS error:", err.message);
    return false;
  }
};
