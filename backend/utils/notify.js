import Notification from "../models/Notification.js";
import env from "../config/env.js";
import nodemailer from "nodemailer";

let mailer = null;

// 📧 Mailer config (SMTP)
if (env.smtp?.host && env.smtp?.user) {
  mailer = nodemailer.createTransport({
    host: env.smtp.host,
    port: Number(env.smtp.port || 587),
    secure: env.smtp.secure === true || env.smtp.secure === "true",
    auth: {
      user: env.smtp.user,
      pass: env.smtp.pass,
    },
  });
}

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    if (!mailer) {
      console.warn("Mailer not configured - skipping email send");
      return { success: false, message: "Mailer not configured" };
    }

    const info = await mailer.sendMail({
      from: env.smtp.from || env.smtp.user,
      to,
      subject,
      text,
      html,
    });

    return { success: true, info };
  } catch (err) {
    console.error("sendEmail error:", err);
    return { success: false, error: err.message || err };
  }
};

// 📱 SMS (Twilio)
const sendSMS = async ({ to, body }) => {
  try {
    if (!env.twilio?.sid || !env.twilio?.token || !env.twilio?.from) {
      console.warn("Twilio not configured - skipping SMS send");
      return { success: false, message: "SMS provider not configured" };
    }

    const Twilio = await import("twilio");
    const client = new Twilio.default(env.twilio.sid, env.twilio.token);

    const res = await client.messages.create({
      body,
      from: env.twilio.from,
      to,
    });

    return { success: true, res };
  } catch (err) {
    console.error("sendSMS error:", err);
    return { success: false, error: err.message || err };
  }
};


// 🔔 In-App + optional SMS/OTP (Fixed duplicate notification issue)
const sendInApp = async ({
  recipientId,
  actorId = null,
  type = "general",
  title,
  message = "",
  data = {},
  phone = null,
  otp = null, // ✅ added OTP param
}) => {
  try {
    const notif = await Notification.create({
      user: recipientId,
      actor: actorId,
      type,
      title,
      message,
      data,
    });

    // 🧠 Initialize global lock map (for deduplication)
    if (!global.__notifLock) global.__notifLock = new Map();
    const lockKey = `${recipientId}-${type}-${title}-${data?.bookingId || ""}`;

    // If recently emitted same notification, skip duplicate emit
    const lastEmit = global.__notifLock.get(lockKey);
    const now = Date.now();
    if (!lastEmit || now - lastEmit > 2000) {
      if (global?.io) {
        global.io
          .to(`notifications:${recipientId}`)
          .emit("notification:new", notif);
      }
      global.__notifLock.set(lockKey, now);
    } else {
      console.log("⚠️ Duplicate notification prevented:", lockKey);
    }

    // 📱 SMS OTP (only if phone + otp provided)
    if (phone && otp) {
      const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
      await sendSMS({
        to: formattedPhone,
        body: `Your HomeServices OTP: ${otp}`,
      });
    }

    return { success: true, data: notif };
  } catch (err) {
    console.error("sendInApp error:", err);
    return { success: false, error: err.message || err };
  }
};


export { sendEmail, sendSMS, sendInApp };
export default { sendEmail, sendSMS, sendInApp };
