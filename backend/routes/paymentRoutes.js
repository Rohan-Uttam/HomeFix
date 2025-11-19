import express from "express";
import { createOrder, verifyPayment } from "../controllers/paymentController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

//  Client ko logged in hona chahiye order create karne ke liye
router.post("/order", authenticate, createOrder);

//  Razorpay verification ke liye auth ki zarurat nahi
router.post("/verify", verifyPayment);

export default router;
