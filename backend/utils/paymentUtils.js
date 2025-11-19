// backend/utils/paymentUtils.js
import crypto from "crypto";
import env from "../config/env.js";

/**
 * Verify Razorpay payment signature
 * @param {string} orderId
 * @param {string} paymentId
 * @param {string} signature
 */
export const verifyRazorpaySignature = (orderId, paymentId, signature) => {
  const body = orderId + "|" + paymentId;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET || "secret")
    .update(body.toString())
    .digest("hex");
  return expectedSignature === signature;
};
