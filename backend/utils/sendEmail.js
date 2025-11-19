// backend/utils/sendEmail.js
import nodemailer from "nodemailer";
import env from "../config/env.js";
import logger from "../config/logger.js";

/**
 * Send email utility
 * Uses Nodemailer (with Gmail/SMTP). For production: switch to AWS SES/SendGrid.
 */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "your-email@gmail.com",
    pass: process.env.EMAIL_PASS || "your-app-password",
  },
});

/**
 * Send an email
 * @param {string} to - recipient email
 * @param {string} subject - email subject
 * @param {string} html - html content
 */
export const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER || "noreply@homeservices.com",
      to,
      subject,
      html,
    });
    logger.info(`📧 Email sent to ${to} - MessageID: ${info.messageId}`);
    return info;
  } catch (err) {
    logger.error("Email send failed: " + err.message);
    throw new Error("Failed to send email");
  }
};
