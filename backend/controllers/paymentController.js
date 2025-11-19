// backend/controllers/paymentController.js
import Razorpay from "razorpay";
import crypto from "crypto";
import Booking from "../models/Booking.js"; // ⭐ Added
import { successResponse, errorResponse } from "../utils/responseBuilder.js";

//  Razorpay Instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * @desc Create Razorpay Order
 * @route POST /api/payments/order
 * @access Private (Client)
 */
export const createOrder = async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;

    if (!amount || isNaN(amount)) {
      return errorResponse(res, "Valid amount is required", 400);
    }

    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return successResponse(res, "Razorpay order created successfully", order, 201);
  } catch (err) {
    console.error("Razorpay order error:", err);
    return errorResponse(res, "Failed to create order: " + err.message, 500);
  }
};

/**
 * @desc Verify Razorpay Payment
 * @route POST /api/payments/verify
 * @access Private (Client)
 */
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return errorResponse(res, "Missing payment verification details", 400);
    }

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return errorResponse(res, "Invalid Razorpay signature", 400);
    }

    // ✅ Optional: Update booking paymentStatus if bookingId is provided
    if (bookingId) {
      const booking = await Booking.findById(bookingId).populate("worker client");
      if (booking) {
        booking.paymentStatus = "paid";
        await booking.save();
      }
    }

    return successResponse(
      res,
      "Payment verified successfully",
      { razorpay_order_id, razorpay_payment_id, bookingId },
      200
    );
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};
