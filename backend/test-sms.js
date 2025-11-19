import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

async function run() {
  try {
    const res = await client.messages.create({
      body: "🚀 Test OTP from HomeServices",
      from: process.env.TWILIO_FROM,   // +13392178266 (Twilio number)
      to: "+918953010920",            // tera verified number
    });
    console.log(" SMS sent:", res.sid);
  } catch (err) {
    console.error(" SMS error:", err);
  }
}

run();
